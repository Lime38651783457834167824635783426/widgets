'use client'

/*
  Curretnly working on:
   - NA
*/


//imports
import { CSSProperties, useEffect, useReducer } from 'react';
import clsx from 'clsx';
import { keyframes } from "glamor";
import NoSSR from './NoSSR';


// values
const colorRange: Range = [50, 150] ; // range of color, like rgb(a-b, a-b, a-b)
const distance: number = 40; // distance that the ball with travel away from mouse in average vw & vh
const ballHitboxSize: number = 512; // in px
const visibleBallPercent: number = 10;


// types
type Range = [number, number]; // these aliases are just here for clarity
type Position = [number, number];
type Size = { width: number, height: number }
type PositionTime = [Position, Position]; // [prevPosition, currentPosition]
type Action =
  | { type: "move" } // window action dimensions (to avoid confusion)
  | { type: "animationEnded" }
  | { type: "mounted/resized", windowADims: Size, mount?: boolean };
type State = {
  poss: PositionTime, // [current pos, upcoming pos] (positions)
  style: CSSProperties,
  ae: boolean, // animation ended?
  windowDims: Size
};


// utilities
const posToStyle = (pos: Position) => ({ left: pos[0] + 'px', bottom: pos[1] + 'px' });
const getCenterPos = (windowSize: Size): Position => [(windowSize.width - ballHitboxSize) / 2, (windowSize.height - ballHitboxSize) / 2];
const getRandom = (range: Range): number => { while (true) { if (Math.random() > .5) { return (range[1] - range[0]) * Math.random() + range[0] } } }
const getRandomPos = (currentPos: Position, windowSize: Size): Position => {
  const pxDistance: number = distance * ((windowSize.width + windowSize.height) / 200);
  let thingThatPreventsInfiniteLoop: number = 0;

  while (true) {
    thingThatPreventsInfiniteLoop++; // crash/pcExplosion guard
    if (thingThatPreventsInfiniteLoop > 1000) {
      console.warn("While loop would've blew up");
      break;
    }

    const randPos: Position = [
      Math.floor(getRandom([windowSize.width * .1, windowSize.width * 0.9 - 256])), // random width
      Math.floor(getRandom([windowSize.height * 0.1 - 256, windowSize.height * 0.9 - 256])) // random height
    ];
    if (Math.sqrt(Math.pow(randPos[0] - currentPos[0], 2) + Math.pow(randPos[1] - currentPos[1], 2)) > pxDistance) { return randPos }
    // if √{   [  ( randPos[0] - currentPos[0] )^2 + ( randPos[1] - currentPos[1] )^2  ]  >  pxDistance   }      unreadable fr
  }
  return [0, 0]; // fallback
};

// reducer
const init = (state: State): State => ({
  ...state,
  poss: [getCenterPos(state.windowDims), getRandomPos(getCenterPos(state.windowDims), state.windowDims)],
  style: {
    ...state.style,
    ...posToStyle(getCenterPos(state.windowDims)),
    width: ballHitboxSize,
    height: ballHitboxSize,
    background: `radial-gradient(rgb(${getRandom(colorRange)}, ${getRandom(colorRange)}, ${getRandom(colorRange)}) ${visibleBallPercent}%, transparent ${visibleBallPercent}%)`,
  }
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "move":
      return {
        ...state,
        ae: false, // lets component know if animation in progress
        poss: [state.poss[1], getRandomPos(state.poss[1], state.windowDims)], // new becomes now and destiny becomes new
        style: {
          ...state.style,
          animation: keyframes('move', {
            "0%": posToStyle(state.poss[0]),
            "100%": posToStyle(state.poss[1])
          }) + " 0.5s cubic-bezier(0.55, 0.055, 0.675, 1) 1 forwards"
        }
      };
    case "animationEnded":
      return {
        ...state,
        ae: true,
      };
    case "mounted/resized": // if window loaded/reloaded, update the states so they can be random (cuz the random function needs the window dimensions)
      return {
        ...state,
        windowDims: action.windowADims,
        poss: action.mount ? state.poss : [state.poss[1], getRandomPos(state.poss[1], action.windowADims)]
      };
    default:
      return { // fallback
        ...state,
        style: {
          ...state.style,
          color: "black"
        }
      };
  }
}


// component
export default function RBall({ windowDims }: { windowDims: Size }) {
  const [state, dispatch] = useReducer(reducer, {
    ae: true,
    poss: [[0, 0], [0, 0]],
    windowDims: windowDims,
    style: {} // add default regular styles here, and add hard to compute styles in init
  }, init);
  useEffect(() => { 
    dispatch({ type: 'mounted/resized', windowADims: windowDims, mount: windowDims.width === state.windowDims.width });
    if (windowDims !== state.windowDims) { dispatch({ type: 'move' }) }
  }, [windowDims]);

  return (
    <NoSSR>
      <div
        className={clsx(
          "absolute br-full transform-gpu origin-center",
          state.ae ? "flex pointer-events-auto" : "pointer-events-none",
        )}
        onMouseOver={() => { if (state.ae) dispatch({ type: "move" }) }}
        onAnimationEnd={() => dispatch({ type: "animationEnded" })}
        style={state.style}
      />
    </NoSSR>
  );
}

// go brr thing

// const getAnim = (pos: PositionTime): Object => { // gets a big animation obj that would be way too hard to write manually
//   let obj: any = {"0%": pos[0]}; // delare
//   for (let i = 2; i < 99; i += 2) { obj = { ...obj, [i +'px']: posToStyle(getRandomPos(pos[0])) } } // obj will now be obj but with (index)percent: random position
//   obj["100%"] = posToStyle(pos[1]); // makes sure that on last tp it tps/moves to current position (known by react, not just the animation)
//   return obj;
// }