require 'uri'
require 'net/http'
require 'json'
require 'pg'

CONN = PG.connect :dbname => 'bikemap', :user => 'vincent'


def tst_data
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
      (name, type, geog)
      VALUES(
        '#{r["attributes"]["AgencyName"]} #{r["attributes"]["Amenity"]}',
        'bike-repair-station',
        ST_Transform(ST_SetSRID(ST_MakePoint(#{r["geometry"]["x"]}.0, #{r["geometry"]["y"]}.0),3857), 4326)
      )"
  end
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
      (name, type, geog)
      VALUES(
        '#{s['name']}',
        'red-bike-station',
        ST_MakePoint(#{s["longitude"]}, #{s["latitude"]})
      )"
  end

end

# tst_data()
red_bike_data()