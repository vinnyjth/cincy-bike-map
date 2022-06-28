require 'uri'
require 'net/http'
require 'json'
require 'pg'
require 'csv'
require 'open-uri'

CONN = PG.connect ENV['DATABASE_URL']

def quote_string(v)
  v.to_s.gsub(/\\/, '\&\&').gsub(/'/, "''")
end


def insert_lines(type:, layer_name:, layers:)
  layer = layers.find { |l| l["id"].include? layer_name }

  lines = layer["featureCollection"]["layers"][0]["featureSet"]["features"]

  lines.each do |r|
    line = r["geometry"]["paths"][0].map { |p| "ST_MakePoint(#{p[0]}.0, #{p[1]}.0)" }.join(", ")

    line_name = r["attributes"]["RouteName"] && r["attributes"]["SystemName"] &&
      quote_string(r["attributes"]["RouteName"] + " " + r["attributes"]["SystemName"])
    CONN.exec """
    INSERT INTO features
      (name, type, geog_line, data)
      VALUES(
        '#{line_name}',
        '#{type}',
        ST_Transform(
          ST_SetSRID(
            ST_MakeLine(
              ARRAY[ #{line} ]
            ),
            3857
          ),
          4326
        ),
        '#{quote_string(r["attributes"].to_json)}'
      )"""
  end
end

def tst_data
  tst_map_url = "https://greenumbrella.maps.arcgis.com/sharing/rest/content/items/5c30ac77540f4e23b80be526f0ae3d48/data?f=json"

  uri = URI(tst_map_url)
  res = Net::HTTP.get_response(uri)
  result = JSON.parse(res.body) if res.is_a?(Net::HTTPSuccess)

  layers = result["operationalLayers"]


  ### On-Road Bike Facilities
  insert_lines(type: 'bike-lane', layer_name: "BikeOnRoad", layers: layers)

  ### Multi Use Paths
  insert_lines(type: 'multi-use-path', layer_name: "TST_MUPath", layers: layers)
end

def tst_data_calm_streets
  tst_map_url = "https://greenumbrella.maps.arcgis.com/sharing/rest/content/items/914acd14d70e49aaaece4fd88437ccdb/data?f=json"

  uri = URI(tst_map_url)
  res = Net::HTTP.get_response(uri)
  result = JSON.parse(res.body) if res.is_a?(Net::HTTPSuccess)

  layers = result["operationalLayers"]


  ### Repair Stations
  repair_stations_meta = layers.find { |l| l["id"].include? "BikeRepairStation" }

  repair_stations = repair_stations_meta["featureCollection"]["layers"][0]["featureSet"]["features"]

  repair_stations.each do |r|
    CONN.exec """
    INSERT INTO features
      (name, type, geog_point)
      VALUES(
        '#{r["attributes"]["AgencyName"]} #{r["attributes"]["Amenity"]}',
        'bike-repair-station',
        ST_Transform(ST_SetSRID(ST_MakePoint(#{r["geometry"]["x"]}.0, #{r["geometry"]["y"]}.0),3857), 4326)
      )"
  end

  ### Slow Streets
  insert_lines(type: 'tst-slow-street', layer_name: "LowStress", layers: layers)

  ### Use With Caution
  insert_lines(type: 'tst-use-with-caution', layer_name: "Usewithcaution", layers: layers)

  ### Bikes on Sidewalk
  insert_lines(type: 'tst-walk-bikes-on-sidewalk', layer_name: "WalkBike", layers: layers)

  ### Existing Trails
  insert_lines(type: 'tst-existing-trails', layer_name: "ExistingTrails", layers: layers)

  ### Bikes on Sidewalk
  # insert_lines(type: 'tst-walk-bikes-on-sidewalk', layer_name: "Hills", layers: layers)  
end

def red_bike_data
  uri = URI("https://redbike.bcycle.com/api/bearertoken/getclient")
  res = Net::HTTP.get_response(uri)
  bearer_result = JSON.parse(res.body) if res.is_a?(Net::HTTPSuccess)  

  uri = URI("https://portal-den.bcycle.com/1/publicApi/kiosks?programId=80")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(uri.request_uri)
  request["Authorization"] = bearer_result["BearerToken"]
  response = http.request(request)

  stations = JSON.parse(response.body)

  stations.each do |s|
    CONN.exec """
    INSERT INTO features
      (name, type, geog_point, data)
      VALUES(
        'Ride Bike Station - #{s['name']}',
        'red-bike-station',
        ST_MakePoint(#{s["longitude"]}, #{s["latitude"]}),
        '#{quote_string(s.to_json)}'
      )"
  end

end

def bike_shop_data
  res = URI.open("https://docs.google.com/spreadsheets/d/e/2PACX-1vQQpjflUVU_-MLrpHRRdBzloDuaMahIhjVTFvwCpAOZWb6Xl4R0dKXL7z33bvDGGtzp51S8RPBecOMr/pub?gid=0&single=true&output=csv").read
  csv = CSV.parse(res, headers: true)
  csv.each do |shop|
    CONN.exec """
    INSERT INTO features
      (name, type, geog_point)
      VALUES(
        '#{quote_string(shop["NAME"])}',
        'bike-shop',
        ST_MakePoint(#{shop["Longitude"]}, #{shop["Latitude"]})
      )"    
  end
end

CONN.exec "delete from features;"

tst_data()
tst_data_calm_streets()
red_bike_data()
bike_shop_data()