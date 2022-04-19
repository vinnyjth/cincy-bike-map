import "maplibre-gl/dist/maplibre-gl.css";
import React, { useRef, useState } from "react";
import PointFeature from "../components/features/point-feature";
import LineFeature from "../components/features/line-feature";
import { COLORS, ICONS } from "../components/config.js";
import Map, { Popup, NavigationControl, ScaleControl } from "react-map-gl";
import maplibregl from "maplibre-gl";
import MaplibreGlDirections from "@maplibre/maplibre-gl-directions";

function MapView() {
  const _map = useRef(null);
  const camera = useRef(null);
  const bottomSheet = useRef(null);
  const legendSheet = useRef(null);
  const userLocation = useRef(null);

  const directions = useRef();

  const [selectedFeature, setSelectedFeature] = useState(null);

  const handlePress = async ({ properties }) => {
    const { screenPointX, screenPointY } = properties;
    const { features } = await _map.current.queryRenderedFeaturesAtPoint(
      [screenPointX, screenPointY],
      ["==", ["get", "tappable"], true]
    );

    if (features.length) {
      bottomSheet.current.expand();
      setSelectedFeature(features[0]);
    } else {
      bottomSheet.current.close();
      setSelectedFeature(null);
    }
  };

  const navigateToSelectedFeature = () => {
    const {
      geometry: { coordinates },
    } = selectedFeature;
    const gmapsLink = `https://www.google.com/maps/dir/?api=1&destination=${
      coordinates[1] + "%2C" + coordinates[0]
    }&travelmode=bicycling`;
    // Linking.openURL(gmapsLink);
  };

  const [bikeLaneShown, setBikeLaneShown] = useState(true);
  const [slowStreetShown, setSlowStreetShown] = useState(true);
  const [cautionStreetShown, setCautionStreetShown] = useState(true);
  const [redBikeShown, setRedBikeShown] = useState(false);
  const [bikeRepairShown, setBikeRepairShown] = useState(true);
  const [bikeShopShown, setBikeShopShown] = useState(true);

  const [popup, setPopup] = useState(null);

  const mapRef = React.useCallback((ref) => {
    let hoveredFeatureIds = [];
    if (ref) {
      const map = ref.getMap();
      if (!map) return;
      map.on("load", () => {
        directions.current = new MaplibreGlDirections(map, {
          profile: "bike",
          requestOptions: {
            alternatives: "true",
          },
        });
        directions.current.interactive = true;
      });

      // console.log(map.getStyle().layers);
      map.loadImage(ICONS.RED_BIKE.default.src, (error, image) => {
        if (error) throw error;
        if (!map.hasImage("red-bike"))
          map.addImage("red-bike", image, { sdf: false });
      });
      map.loadImage(ICONS.BIKE_REPAIR.default.src, (error, image) => {
        if (error) throw error;
        if (!map.hasImage("bike-repair"))
          map.addImage("bike-repair", image, { sdf: false });
      });
      map.loadImage(ICONS.BIKE_SHOP.default.src, (error, image) => {
        console.log(error, image, ICONS.BIKE_SHOP, "error");
        if (error) throw error;
        console.log(image, "image");
        if (!map.hasImage("bike-shop"))
          map.addImage("bike-shop", image, { sdf: false });
      });
      [
        "bike-lane",
        "multi-use-path",
        "tst-slow-street",
        "tst-use-with-caution",
        "tst-walk-bikes-on-sidewalk",
      ].forEach((layer) => {
        map.on("mousemove", layer, ({ features, lngLat }) => {
          if (features.length > 0) {
            const hoveredFeature = features[0];
            if (hoveredFeature.properties.name) {
              const relatedFeatures = map.querySourceFeatures(layer, {
                filter: ["==", ["get", "name"], hoveredFeature.properties.name],
              });
              setPopup({
                longitude: lngLat.lng,
                latitude: lngLat.lat,
                content: hoveredFeature.properties.name,
              });
              hoveredFeatureIds = relatedFeatures.map(({ id }) => id);
              hoveredFeatureIds.forEach((id) => {
                map.setFeatureState({ source: layer, id }, { hover: true });
              });
            } else {
              hoveredFeatureIds = [hoveredFeature.id];
              setPopup({
                longitude: lngLat.lng,
                latitude: lngLat.lat,
                content: hoveredFeature.properties.category,
              });
              map.setFeatureState(
                { source: layer, id: hoveredFeature.id },
                { hover: true }
              );
            }
          }
        });
        map.on("mouseleave", layer, ({ features }) => {
          setPopup(null);
          hoveredFeatureIds.forEach((id) => {
            map.setFeatureState({ source: layer, id }, { hover: false });
          });
        });
      });
    }
  }, []);

  const lineWidth = [
    "step",
    ["zoom"],
    ["+", 5, ["case", ["boolean", ["feature-state", "hover"], false], 3, 0]],
    12,
    ["+", 4, ["case", ["boolean", ["feature-state", "hover"], false], 3, 0]],
    13.5,
    ["+", 4, ["case", ["boolean", ["feature-state", "hover"], false], 3, 0]],
  ];

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0">
      <Map
        // className='absolute top-0 left-0 right-0 bottom-0 w-full'
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        mapLib={maplibregl}
        ref={mapRef}
        mapStyle={`https://api.maptiler.com/maps/e49e15cf-ca6d-4ee3-bafc-43aa70f645da/style.json?key=N2nAGwZyiTGggBTwzZcv`}
        onDidFailLoadingMap={(e) => console.log("failed", e)}
        logoEnabled={false}
        showUserLocation
        compassEnabled
        compassViewPosition={0}
        minZoomLevel={10}
        // style={{width: '100vw', height: '100vw'}}
        onZoom={console.log}
        maxBounds={[-86.024447, 37.426663, -83.008239, 39.824396]}
        initialViewState={{
          longitude: -84.5191,
          latitude: 39.0653,
          zoom: 12,
        }}
        onPress={handlePress}
      >
        {/* <MapboxGL.UserLocation renderMode={'normal'} ref={userLocation} /> */}
        <NavigationControl />
        <ScaleControl position="bottom-right" unit="imperial" />
        <LineFeature
          featureName="bike-lane"
          style={{
            // 'line-dash-array': [2, 4],
            "line-color": COLORS.BIKE_LANE,
            "line-width": lineWidth,
          }}
          visible={bikeLaneShown}
        />
        <LineFeature
          featureName="multi-use-path"
          style={{
            "line-width": lineWidth,
            "line-color": COLORS.BIKE_LANE,
          }}
          visible={bikeLaneShown}
        />
        <LineFeature
          featureName="tst-slow-street"
          style={{
            "line-width": lineWidth,
            "line-color": COLORS.SLOW_STREET,
          }}
          category="Low Stress Bike Route"
          visible={slowStreetShown}
        />
        <LineFeature
          featureName="tst-use-with-caution"
          style={{
            // 'line-width': ['step', {input: ['get', 'zoom'], stop_output_0: 2, stop_input_1: 13.5, stop_output_1: 5}],
            "line-width": lineWidth,
            "line-color": COLORS.USE_WITH_CAUTION,
          }}
          category={"Use With Caution"}
          visible={cautionStreetShown}
        />
        <LineFeature
          featureName="tst-walk-bikes-on-sidewalk"
          style={{
            // 'line-width': ['step', {input: ['get', 'zoom'], stop_output_0: 2, stop_input_1: 13.5, stop_output_1: 5}],
            "line-width": lineWidth,
            "line-dasharray": [1, 1],
            "line-color": COLORS.WALK_BIKE,
          }}
          category={"Walk Bike on Sidewalk"}
          visible={cautionStreetShown}
        />
        {/* <PointFeature
          featureName="bike-repair-station"
          featureImage={"bike-repair"}
          visible={bikeRepairShown}
        />
        <PointFeature
          featureName="bike-shop"
          featureImage={"bike-shop"}
          style={{ "icon-size": 0.15 }}
          visible={bikeShopShown}
        />
        <PointFeature
          featureName="red-bike-station"
          featureImage={"red-bike"}
          style={{ "icon-size": 0.2 }}
          visible={redBikeShown}
        /> */}
        {popup && (
          <Popup
            longitude={popup.longitude}
            latitude={popup.latitude}
            anchor="bottom"
            className="absolute"
            offset={10}
            onClose={() => setPopup(null)}
          >
            {popup.content}
          </Popup>
        )}
      </Map>
      <div className="absolute bottom-0 left-0 p-2 bg-white drop-shadow-lg">
        <div className="p-4 relative">
          <div className="absolute top-0 left-0 w-16 h-full bg-[#f9d0a0]"></div>
          <div className="relative">
            <div className="flex justify-items-center items-center">
              <div
                className="h-1 w-20"
                style={{ backgroundColor: COLORS.BIKE_LANE }}
              ></div>
              <span className="m-2">Trails, Paths, and Bike Lanes</span>
              <input
                type={"checkbox"}
                checked={bikeLaneShown}
                onChange={() => setBikeLaneShown((prev) => !prev)}
              />
            </div>
            <div className="flex justify-items-center items-center">
              <div
                className="h-1 w-20"
                style={{ backgroundColor: COLORS.SLOW_STREET }}
              ></div>
              <span className="m-2">Low Stress Routes</span>
              <input type={"checkbox"} 
                checked={slowStreetShown}
                onChange={() => setSlowStreetShown((prev) => !prev)}              
              />
            </div>
            <div className="flex justify-items-center items-center">
              <div
                className="h-1 w-20"
                style={{ backgroundColor: COLORS.USE_WITH_CAUTION }}
              ></div>
              <span className="m-2">Use Caution</span>
              <input
                checked={cautionStreetShown}
                onChange={() => setCautionStreetShown((prev) => !prev)}                            
              type={"checkbox"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;
