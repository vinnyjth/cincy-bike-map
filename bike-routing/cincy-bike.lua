-- Bicycle profile

api_version = 4

Set = require('lib/set')
Sequence = require('lib/sequence')
Handlers = require("lib/way_handlers")
find_access_tag = require("lib/access").find_access_tag
limit = require("lib/maxspeed").limit
Measure = require("lib/measure")

list = {0.4040111813705065,0.4077509707194649,0.4115930094776843,0.41554190707638683,0.419602561205936,0.42378018077868934,0.4280803111034602,0.43250886151983375,0.43707213577212073,0.4417768654386842,0.44663024677340407,0.4516399813629164,0.45681432105685077,0.46216211768961296,0.46769287818247157,0.47341682569514565,0.4793449675882814,0.4854891710638476,0.4918622474715554,0.49847804640803445,0.5053515608941388,0.5124990450969183,0.5199381462693039,0.5276880528151419,0.5357696606525774,0.5442057603471956,0.5530212478192406,0.5622433617966259,0.5719019515848806,0.5820297791502957,0.5926628599510663,0.6038408473818764,0.6156074660856684,0.6280109996784702,0.6411048385477748,0.6549480932017125,0.6696062779906035,0.6851520686459992,0.7016661346382446,0.7192380433680241,0.7379672270496413,0.7579639940024726,0.7793505529460762,0.8022620006557876,0.826847198831215,0.8532694343893874,0.8817067185549876,0.9123515356952666,0.9454098073807813,0.9810987996660977,1.0196436869904062,1.0612725155267435,1.1062094072354913,1.154666035145556,1.206831686614459,1.262862588811012,1.3228715297368607,1.386919058946579,1.4550075750313445,1.5270793258312663,1.603018782583213,1.6826591333307126,1.7657919757398155,1.8521788610886971,1.9415632418225015,2.0336815766458516,2.1282727347390007,2.2250852757628166,2.3238825566437655,2.4244458751913984,2.526575998468329,2.6300934640510762,2.734838018511459,2.8406675004812123,2.9474564080893972,3.05509432606533,3.1634843330276547,3.2725414664448174,3.382191290874559,3.492368592633609,3.6030162089714017,3.7140839902231964,3.825527887713802,3.937309157144547,4.049393665912615,4.1617512926354046,4.274355407635642,4.387182423985552,4.50021140971591,4.613423752846485,4.726802871914744,4.840333965631132,4.954003796150395,5.0678005012152,5.181713431100397,5.295733006870892,5.409850596970382,5.524058409591401,5.638349398647695,5.7527171814864015}
min_slope = -0.25
max_slope = 0.25
N = 100

function setup()
  local default_speed = 15
  local walking_speed = 4
  local preferred_speed = 20
  local caution_speed = 17

  local raster_path = os.getenv('OSRM_RASTER_SOURCE') or "/data/rastersource.asc"

  return {
    properties = {
      u_turn_penalty                = 20,
      traffic_light_penalty         = 2,
      weight_name                   = 'cyclability',
    --   weight_name                   = 'duration',
      process_call_tagless_node     = false,
      max_speed_for_map_matching    = 110/3.6, -- kmph -> m/s
      use_turn_restrictions         = false,
      continue_straight_at_waypoint = false,
      mode_change_penalty           = 30,
    },

    raster_source = raster:load(
      raster_path,
      -85,    -- lon_min
      80,  -- lon_max
      35,    -- lat_min
      40,  -- lat_max
      6000,    -- nrows
      6000     -- ncols
    ),

    default_mode              = mode.cycling,
    default_speed             = default_speed,
    walking_speed             = walking_speed,
    oneway_handling           = true,
    turn_penalty              = 6,
    turn_bias                 = 1.4,
    use_public_transport      = true,

    allowed_start_modes = Set {
      mode.cycling,
      mode.pushing_bike
    },

    barrier_blacklist = Set {
      'yes',
      'wall',
      'fence'
    },

    access_tag_whitelist = Set {
      'yes',
      'permissive',
      'designated'
    },

    access_tag_blacklist = Set {
      'no',
      'private',
      'agricultural',
      'forestry',
      'delivery',
      -- When a way is tagged with `use_sidepath` a parallel way suitable for
      -- cyclists is mapped and must be used instead (by law). This tag is
      -- used on ways that normally may be used by cyclists, but not when
      -- a signposted parallel cycleway is available. For purposes of routing
      -- cyclists, this value should be treated as 'no access for bicycles'.
      'use_sidepath'
    },

    restricted_access_tag_list = Set { },

    restricted_highway_whitelist = Set { },

    -- tags disallow access to in combination with highway=service
    service_access_tag_blacklist = Set { },

    construction_whitelist = Set {
      'no',
      'widening',
      'minor',
    },

    access_tags_hierarchy = Sequence {
      'bicycle',
      'vehicle',
      'access'
    },

    restrictions = Set {
      'bicycle'
    },

    cycleway_tags = Set {
      'track',
      'lane',
      'share_busway',
      'sharrow',
      'shared',
      'shared_lane'
    },

    opposite_cycleway_tags = Set {
      'opposite',
      'opposite_lane',
      'opposite_track',
    },

    -- reduce the driving speed by 30% for unsafe roads
    -- only used for cyclability metric
    unsafe_highway_list = {
      primary = 0.5,
      secondary = 0.65,
      tertiary = 0.8,
      primary_link = 0.5,
      secondary_link = 0.65,
      tertiary_link = 0.8,
    },

    service_penalties = {
      alley             = 0.5,
    },

    bicycle_speeds = {
      cycleway = default_speed,
      primary = default_speed,
      primary_link = default_speed,
      secondary = default_speed,
      secondary_link = default_speed,
      tertiary = default_speed,
      tertiary_link = default_speed,
      residential = default_speed,
      unclassified = default_speed,
      living_street = default_speed,
      road = default_speed,
      service = default_speed,
      track = 12,
      path = 12
    },

    pedestrian_speeds = {
      footway = walking_speed,
      pedestrian = walking_speed,
      steps = 2
    },

    railway_speeds = {
      train = 10,
      railway = 10,
      subway = 10,
      light_rail = 10,
      monorail = 10,
      tram = 10
    },

    platform_speeds = {
      platform = walking_speed
    },

    amenity_speeds = {
      parking = 10,
      parking_entrance = 10
    },

    man_made_speeds = {
      pier = walking_speed
    },

    route_speeds = {
      ferry = 5
    },

    bridge_speeds = {
      movable = 5
    },

    surface_speeds = {
      asphalt = default_speed,
      ["cobblestone:flattened"] = 10,
      paving_stones = 10,
      compacted = 10,
      cobblestone = 6,
      unpaved = 6,
      fine_gravel = 6,
      gravel = 6,
      pebblestone = 6,
      ground = 6,
      dirt = 6,
      earth = 6,
      grass = 6,
      mud = 3,
      sand = 3,
      sett = 10
    },

    classes = Sequence {
        'ferry', 'tunnel'
    },

    -- Which classes should be excludable
    -- This increases memory usage so its disabled by default.
    excludable = Sequence {
--        Set {'ferry'}
    },

    tracktype_speeds = {
    },

    smoothness_speeds = {
    },

    avoid = Set {
      'impassable',
      'construction'
    }
  }
end

function process_segment (profile, segment)
  local sourceData = raster:interpolate(profile.raster_source, segment.source.lon, segment.source.lat)
  local targetData = raster:interpolate(profile.raster_source, segment.target.lon, segment.target.lat)
  
  local invalid = sourceData.invalid_data()
  local scaled_weight = segment.weight
  local scaled_duration = segment.duration
  --io.write("evaluating segment: " .. sourceData.datum .. " m to " .. targetData.datum .. " m with distance " .. segment.distance .. "\n")

  if sourceData.datum == invalid then
    print("invalid")
  end

  if sourceData.datum ~= invalid and targetData.datum ~= invalid and segment.distance > 0 then
    local slope = (targetData.datum - sourceData.datum) / segment.distance
	local slope_idx = math.floor((slope - min_slope) / (max_slope - min_slope) * N)
	if slope_idx < 1 then
		slope_idx = 1
	end
	if slope_idx > N then
		slope_idx = N
	end
	
	scaled_weight = list[slope_idx] * scaled_weight
	scaled_duration = list[slope_idx] * scaled_duration
	
	--original calculation: is undefined for slope = 0.2
    --scaled_weight = scaled_weight / (1.0 - (slope * 5.0))
    --scaled_duration = scaled_duration / (1.0 - (slope * 5.0))
	--io.write("   slope: " .. slope .. "\n")
	--io.write("   was weight: " .. segment.weight .. "\n")
	--io.write("   new weight: " .. scaled_weight .. "\n")
	--io.write("   was duration: " .. segment.duration .. "\n")
	--io.write("   new duration: " .. scaled_duration .. "\n")
  end

  segment.weight = scaled_weight
  segment.duration = scaled_duration
end

function process_node(profile, node, result)
  -- parse access and barrier tags
  local highway = node:get_value_by_key("highway")
  local is_crossing = highway and highway == "crossing"

  local access = find_access_tag(node, profile.access_tags_hierarchy)
  if access and access ~= "" then
    -- access restrictions on crossing nodes are not relevant for
    -- the traffic on the road
    if profile.access_tag_blacklist[access] and not is_crossing then
      result.barrier = true
    end
  else
    local barrier = node:get_value_by_key("barrier")
    if barrier and "" ~= barrier then
      if profile.barrier_blacklist[barrier] then
        result.barrier = true
      end
    end
  end

  -- check if node is a traffic light
  local tag = node:get_value_by_key("highway")
  if tag and "traffic_signals" == tag then
    result.traffic_lights = true
  end
end

function handle_bicycle_tags(profile,way,result,data)
    -- initial routability check, filters out buildings, boundaries, etc
  data.route = way:get_value_by_key("route")
  data.man_made = way:get_value_by_key("man_made")
  data.railway = way:get_value_by_key("railway")
  data.amenity = way:get_value_by_key("amenity")
  data.public_transport = way:get_value_by_key("public_transport")
  data.bridge = way:get_value_by_key("bridge")

  if (not data.highway or data.highway == '') and
  (not data.route or data.route == '') and
  (not profile.use_public_transport or not data.railway or data.railway=='') and
  (not data.amenity or data.amenity=='') and
  (not data.man_made or data.man_made=='') and
  (not data.public_transport or data.public_transport=='') and
  (not data.bridge or data.bridge=='')
  then
    return false
  end

  -- access
  data.access = find_access_tag(way, profile.access_tags_hierarchy)
  if data.access and profile.access_tag_blacklist[data.access] then
    return false
  end

  -- other tags
  data.junction = way:get_value_by_key("junction")
  data.maxspeed = Measure.get_max_speed(way:get_value_by_key ("maxspeed")) or 0
  data.maxspeed_forward = Measure.get_max_speed(way:get_value_by_key("maxspeed:forward")) or 0
  data.maxspeed_backward = Measure.get_max_speed(way:get_value_by_key("maxspeed:backward")) or 0
  data.barrier = way:get_value_by_key("barrier")
  data.oneway = way:get_value_by_key("oneway")
  data.oneway_bicycle = way:get_value_by_key("oneway:bicycle")
  data.cycleway = way:get_value_by_key("cycleway")
  data.cycleway_left = way:get_value_by_key("cycleway:left")
  data.cycleway_right = way:get_value_by_key("cycleway:right")
  data.duration = way:get_value_by_key("duration")
  data.service = way:get_value_by_key("service")
  data.foot = way:get_value_by_key("foot")
  data.foot_forward = way:get_value_by_key("foot:forward")
  data.foot_backward = way:get_value_by_key("foot:backward")
  data.bicycle = way:get_value_by_key("bicycle")

  data.tst_caution = way:get_value_by_key("tst-use-with-caution") or false
  data.tst_preferred = way:get_value_by_key("tst-slow-street") or false
  data.tst_sidewalk = way:get_value_by_key("tst-walk-bikes-on-sidewalk") or false
  data.tst_mup = way:get_value_by_key("tst-existing-trails") or false
  data.tst_bike_lane = way:get_value_by_key("tst-bike-lanes") or false
  
  speed_handler(profile,way,result,data)

  oneway_handler(profile,way,result,data)

  cycleway_handler(profile,way,result,data)

  bike_push_handler(profile,way,result,data)


  -- maxspeed
  limit( result, data.maxspeed, data.maxspeed_forward, data.maxspeed_backward )

  -- not routable if no speed assigned
  -- this avoid assertions in debug builds
  if result.forward_speed <= 0 and result.duration <= 0 then
    result.forward_mode = mode.inaccessible
  end
  if result.backward_speed <= 0 and result.duration <= 0 then
    result.backward_mode = mode.inaccessible
  end

  safety_handler(profile,way,result,data)
end



function speed_handler(profile,way,result,data)

  data.way_type_allows_pushing = false

  -- speed
  local bridge_speed = profile.bridge_speeds[data.bridge]
  if (bridge_speed and bridge_speed > 0) then
    data.highway = data.bridge
    if data.duration and durationIsValid(data.duration) then
      result.duration = math.max( parseDuration(data.duration), 1 )
    end
    result.forward_speed = bridge_speed
    result.backward_speed = bridge_speed
    data.way_type_allows_pushing = true
  elseif profile.route_speeds[data.route] then
    -- ferries (doesn't cover routes tagged using relations)
    result.forward_mode = mode.ferry
    result.backward_mode = mode.ferry
    if data.duration and durationIsValid(data.duration) then
      result.duration = math.max( 1, parseDuration(data.duration) )
    else
       result.forward_speed = profile.route_speeds[data.route]
       result.backward_speed = profile.route_speeds[data.route]
    end
  -- railway platforms (old tagging scheme)
  elseif data.railway and profile.platform_speeds[data.railway] then
    result.forward_speed = profile.platform_speeds[data.railway]
    result.backward_speed = profile.platform_speeds[data.railway]
    data.way_type_allows_pushing = true
  -- public_transport platforms (new tagging platform)
  elseif data.public_transport and profile.platform_speeds[data.public_transport] then
    result.forward_speed = profile.platform_speeds[data.public_transport]
    result.backward_speed = profile.platform_speeds[data.public_transport]
    data.way_type_allows_pushing = true
  -- railways
  elseif profile.use_public_transport and data.railway and profile.railway_speeds[data.railway] and profile.access_tag_whitelist[data.access] then
    result.forward_mode = mode.train
    result.backward_mode = mode.train
    result.forward_speed = profile.railway_speeds[data.railway]
    result.backward_speed = profile.railway_speeds[data.railway]
  elseif data.amenity and profile.amenity_speeds[data.amenity] then
    -- parking areas
    result.forward_speed = profile.amenity_speeds[data.amenity]
    result.backward_speed = profile.amenity_speeds[data.amenity]
    data.way_type_allows_pushing = true
  elseif profile.bicycle_speeds[data.highway] then
    -- regular ways
    result.forward_speed = profile.bicycle_speeds[data.highway]
    result.backward_speed = profile.bicycle_speeds[data.highway]
    data.way_type_allows_pushing = true
  elseif data.access and profile.access_tag_whitelist[data.access]  then
    -- unknown way, but valid access tag
    result.forward_speed = profile.default_speed
    result.backward_speed = profile.default_speed
    data.way_type_allows_pushing = true
  end

--   if data.tst_caution then
--     print("Caution")
--     result.forward_speed = profile.caution_speed
--     result.backward_speed = profile.caution_speed
--   elseif data.tst_preferred then 
--     print("Preferred")
--     result.forward_speed = profile.preferred_speed
--     result.backward_speed = profile.preferred_speed    
--   end
end

function oneway_handler(profile,way,result,data)
  -- oneway
  data.implied_oneway = data.junction == "roundabout" or data.junction == "circular" or data.highway == "motorway"
  data.reverse = false

  if data.oneway_bicycle == "yes" or data.oneway_bicycle == "1" or data.oneway_bicycle == "true" then
    result.backward_mode = mode.inaccessible
  elseif data.oneway_bicycle == "no" or data.oneway_bicycle == "0" or data.oneway_bicycle == "false" then
   -- prevent other cases
  elseif data.oneway_bicycle == "-1" then
    result.forward_mode = mode.inaccessible
    data.reverse = true
  elseif data.oneway == "yes" or data.oneway == "1" or data.oneway == "true" then
    result.backward_mode = mode.inaccessible
  elseif data.oneway == "no" or data.oneway == "0" or data.oneway == "false" then
    -- prevent other cases
  elseif data.oneway == "-1" then
    result.forward_mode = mode.inaccessible
    data.reverse = true
  elseif data.implied_oneway then
    result.backward_mode = mode.inaccessible
  end
end

function cycleway_handler(profile,way,result,data)
  -- cycleway
  data.has_cycleway_forward = false
  data.has_cycleway_backward = false
  data.is_twoway = result.forward_mode ~= mode.inaccessible and result.backward_mode ~= mode.inaccessible and not data.implied_oneway

  -- cycleways on normal roads
  if data.is_twoway then
    if data.cycleway and profile.cycleway_tags[data.cycleway] then
      data.has_cycleway_backward = true
      data.has_cycleway_forward = true
    end
    if (data.cycleway_right and profile.cycleway_tags[data.cycleway_right]) or (data.cycleway_left and profile.opposite_cycleway_tags[data.cycleway_left]) then
      data.has_cycleway_forward = true
    end
    if (data.cycleway_left and profile.cycleway_tags[data.cycleway_left]) or (data.cycleway_right and profile.opposite_cycleway_tags[data.cycleway_right]) then
      data.has_cycleway_backward = true
    end
  else
    local has_twoway_cycleway = (data.cycleway and profile.opposite_cycleway_tags[data.cycleway]) or (data.cycleway_right and profile.opposite_cycleway_tags[data.cycleway_right]) or (data.cycleway_left and profile.opposite_cycleway_tags[data.cycleway_left])
    local has_opposite_cycleway = (data.cycleway_left and profile.opposite_cycleway_tags[data.cycleway_left]) or (data.cycleway_right and profile.opposite_cycleway_tags[data.cycleway_right])
    local has_oneway_cycleway = (data.cycleway and profile.cycleway_tags[data.cycleway]) or (data.cycleway_right and profile.cycleway_tags[data.cycleway_right]) or (data.cycleway_left and profile.cycleway_tags[data.cycleway_left])

    -- set cycleway even though it is an one-way if opposite is tagged
    if has_twoway_cycleway then
      data.has_cycleway_backward = true
      data.has_cycleway_forward = true
    elseif has_opposite_cycleway then
      if not data.reverse then
        data.has_cycleway_backward = true
      else
        data.has_cycleway_forward = true
      end
    elseif has_oneway_cycleway then
      if not data.reverse then
        data.has_cycleway_forward = true
      else
        data.has_cycleway_backward = true
      end

    end
  end

  if data.has_cycleway_backward then
    result.backward_mode = mode.cycling
    result.backward_speed = profile.bicycle_speeds["cycleway"]
  end

  if data.has_cycleway_forward then
    result.forward_mode = mode.cycling
    result.forward_speed = profile.bicycle_speeds["cycleway"]
  end
end

function bike_push_handler(profile,way,result,data)
  -- pushing bikes - if no other mode found
  if result.forward_mode == mode.inaccessible or result.backward_mode == mode.inaccessible or
    result.forward_speed == -1 or result.backward_speed == -1 then
    if data.foot ~= 'no' then
      local push_forward_speed = nil
      local push_backward_speed = nil

      if profile.pedestrian_speeds[data.highway] then
        push_forward_speed = profile.pedestrian_speeds[data.highway]
        push_backward_speed = profile.pedestrian_speeds[data.highway]
      elseif data.man_made and profile.man_made_speeds[data.man_made] then
        push_forward_speed = profile.man_made_speeds[data.man_made]
        push_backward_speed = profile.man_made_speeds[data.man_made]
      else
        if data.foot == 'yes' then
          push_forward_speed = profile.walking_speed
          if not data.implied_oneway then
            push_backward_speed = profile.walking_speed
          end
        elseif data.foot_forward == 'yes' then
          push_forward_speed = profile.walking_speed
        elseif data.foot_backward == 'yes' then
          push_backward_speed = profile.walking_speed
        elseif data.way_type_allows_pushing then
          push_forward_speed = profile.walking_speed
          if not data.implied_oneway then
            push_backward_speed = profile.walking_speed
          end
        end
      end

      if push_forward_speed and (result.forward_mode == mode.inaccessible or result.forward_speed == -1) then
        result.forward_mode = mode.pushing_bike
        result.forward_speed = push_forward_speed
      end
      if push_backward_speed and (result.backward_mode == mode.inaccessible or result.backward_speed == -1)then
        result.backward_mode = mode.pushing_bike
        result.backward_speed = push_backward_speed
      end

    end

  end

  -- dismount
  if data.bicycle == "dismount" then
    result.forward_mode = mode.pushing_bike
    result.backward_mode = mode.pushing_bike
    result.forward_speed = profile.walking_speed
    result.backward_speed = profile.walking_speed
  end
end

function safety_handler(profile,way,result,data)
  -- convert duration into cyclability 
  if profile.properties.weight_name == 'cyclability' then
    local safety_penalty = profile.unsafe_highway_list[data.highway] or 1.
    local is_unsafe = safety_penalty < 1

    -- primaries that are one ways are probably huge primaries where the lanes need to be separated
    if is_unsafe and data.highway == 'primary' and not data.is_twoway then
      safety_penalty = safety_penalty * 0.5
    end
    if is_unsafe and data.highway == 'secondary' and not data.is_twoway then
      safety_penalty = safety_penalty * 0.6
    end

    local forward_is_unsafe = is_unsafe and not data.has_cycleway_forward
    local backward_is_unsafe = is_unsafe and not data.has_cycleway_backward
    local is_undesireable = data.highway == "service" and profile.service_penalties[data.service]
    local forward_penalty = 1.
    local backward_penalty = 1.
    if forward_is_unsafe then
      forward_penalty = math.min(forward_penalty, safety_penalty)
    end
    if backward_is_unsafe then
       backward_penalty = math.min(backward_penalty, safety_penalty)
    end

    if is_undesireable then
       forward_penalty = math.min(forward_penalty, profile.service_penalties[data.service])
       backward_penalty = math.min(backward_penalty, profile.service_penalties[data.service])
    end

    if result.forward_speed > 0 then
      -- convert from km/h to m/s
      result.forward_rate = result.forward_speed / 3.6 * forward_penalty
    end
    if result.backward_speed > 0 then
      -- convert from km/h to m/s
      result.backward_rate = result.backward_speed / 3.6 * backward_penalty
    end
    if result.duration > 0 then
      result.weight = result.duration / forward_penalty
    end

    if data.highway == "bicycle" then
      safety_bonus = safety_bonus + 0.2
      if result.forward_speed > 0 then
        -- convert from km/h to m/s
        result.forward_rate = result.forward_speed / 3.6 * safety_bonus
      end
      if result.backward_speed > 0 then
        -- convert from km/h to m/s
        result.backward_rate = result.backward_speed / 3.6 * safety_bonus
      end
      if result.duration > 0 then
        result.weight = result.duration / safety_bonus
      end
    end

    if data.tst_mup then 
      safety_bonus = 10
      if result.forward_speed > 0 then
        -- convert from km/h to m/s
        result.forward_rate = result.forward_speed / 3.6 * safety_bonus
      end
      if result.backward_speed > 0 then
        -- convert from km/h to m/s
        result.backward_rate = result.backward_speed / 3.6 * safety_bonus
      end
      if result.duration > 0 then
        result.weight = result.duration * safety_bonus
      end
    elseif data.tst_bike_lane then 
      print('bike lane')
      safety_bonus = 8.5
      if result.forward_speed > 0 then
        -- convert from km/h to m/s
        result.forward_rate = result.forward_speed / 3.6 * safety_bonus
      end
      if result.backward_speed > 0 then
        -- convert from km/h to m/s
        result.backward_rate = result.backward_speed / 3.6 * safety_bonus
      end
      if result.duration > 0 then
        result.weight = result.duration * safety_bonus
      end      
    elseif data.tst_preferred then 
      print('preferred')
      safety_bonus = 9
      if result.forward_speed > 0 then
        -- convert from km/h to m/s
        result.forward_rate = result.forward_speed / 3.6 * safety_bonus
      end
      if result.backward_speed > 0 then
        -- convert from km/h to m/s
        result.backward_rate = result.backward_speed / 3.6 * safety_bonus
      end
      if result.duration > 0 then
        result.weight = result.duration * safety_bonus
      end
    elseif data.tst_caution then
      print('caution')
      safety_bonus = 2
      if result.forward_speed > 0 then
        -- convert from km/h to m/s
        result.forward_rate = result.forward_speed / 3.6 * safety_bonus
      end
      if result.backward_speed > 0 then
        -- convert from km/h to m/s
        result.backward_rate = result.backward_speed / 3.6 * safety_bonus
      end
      if result.duration > 0 then
        result.weight = result.duration * safety_bonus
      end
    end            
  end
end



function process_way(profile, way, result)
  -- the initial filtering of ways based on presence of tags
  -- affects processing times significantly, because all ways
  -- have to be checked.
  -- to increase performance, prefetching and initial tag check
  -- is done directly instead of via a handler.

  -- in general we should try to abort as soon as
  -- possible if the way is not routable, to avoid doing
  -- unnecessary work. this implies we should check things that
  -- commonly forbids access early, and handle edge cases later.

  -- data table for storing intermediate values during processing

  local data = {
    -- prefetch tags
    highway = way:get_value_by_key('highway'),

    route = nil,
    man_made = nil,
    railway = nil,
    amenity = nil,
    public_transport = nil,
    bridge = nil,

    access = nil,

    junction = nil,
    maxspeed = nil,
    maxspeed_forward = nil,
    maxspeed_backward = nil,
    barrier = nil,
    oneway = nil,
    oneway_bicycle = nil,
    cycleway = nil,
    cycleway_left = nil,
    cycleway_right = nil,
    duration = nil,
    service = nil,
    foot = nil,
    foot_forward = nil,
    foot_backward = nil,
    bicycle = nil,

    way_type_allows_pushing = false,
    has_cycleway_forward = false,
    has_cycleway_backward = false,
    is_twoway = true,
    reverse = false,
    implied_oneway = false
  }

  local handlers = Sequence {
    -- set the default mode for this profile. if can be changed later
    -- in case it turns we're e.g. on a ferry
    WayHandlers.default_mode,

    -- check various tags that could indicate that the way is not
    -- routable. this includes things like status=impassable,
    -- toll=yes and oneway=reversible
    WayHandlers.blocked_ways,

    -- our main handler
    handle_bicycle_tags,

    -- compute speed taking into account way type, maxspeed tags, etc.
    WayHandlers.surface,

    -- handle turn lanes and road classification, used for guidance
    WayHandlers.classification,

    -- handle allowed start/end modes
    WayHandlers.startpoint,

    -- handle roundabouts
    WayHandlers.roundabouts,

    -- set name, ref and pronunciation
    WayHandlers.names,

    -- set classes
    WayHandlers.classes,

    -- set weight properties of the way
    WayHandlers.weights
  }

  WayHandlers.run(profile, way, result, data, handlers)
end

function process_turn(profile, turn)
  -- compute turn penalty as angle^2, with a left/right bias
  local normalized_angle = turn.angle / 90.0
  if normalized_angle >= 0.0 then
    turn.duration = normalized_angle * normalized_angle * profile.turn_penalty / profile.turn_bias
  else
    turn.duration = normalized_angle * normalized_angle * profile.turn_penalty * profile.turn_bias
  end

  if turn.is_u_turn then
    turn.duration = turn.duration + profile.properties.u_turn_penalty
  end

  if turn.has_traffic_light then
     turn.duration = turn.duration + profile.properties.traffic_light_penalty
  end
  if profile.properties.weight_name == 'cyclability' then
    turn.weight = turn.duration
  end
  if turn.source_mode == mode.cycling and turn.target_mode ~= mode.cycling then
    turn.weight = turn.weight + profile.properties.mode_change_penalty
  end
end

return {
  setup = setup,
  process_way = process_way,
  process_node = process_node,
  process_segment = process_segment,
  process_turn = process_turn
}