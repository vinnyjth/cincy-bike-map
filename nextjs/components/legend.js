import React from 'react'
import { COLORS } from './config'

const Legend = ({ setBikeLaneShown, setSlowStreetShown, setCautionStreetShown, bikeLaneShown, slowStreetShown, cautionStreetShown }) => {
    return (
        <div className="absolute bottom-2 left-2 p-2 bg-white drop-shadow-lg">
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
    )
}

export default Legend;