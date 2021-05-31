import React, {Suspense, useRef} from 'react';
import {Canvas, extend, useFrame, useThree} from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Grid from "./components/Grid";
import * as THREE from 'three';

import './App.css'

extend({ OrbitControls });

function Controls({gridSize, getCameraPosition}) {
    const [cameraY] = React.useState(15)
    const [cameraZ, setCameraZ] = React.useState(0)
    const [cameraX, setCameraX] = React.useState(0)
    const controls = useRef()
    const { camera, gl } = useThree()

    const handleUserKeyPress = React.useCallback(e => {
        /*if(e.key === 's'){
            if(cameraZ <= gridSize) {
                setCameraZ(cameraZ + 1)
            }
        }

        if(e.key === 'w'){
            if(cameraZ >= -gridSize) {
                setCameraZ(cameraZ - 1)
            }
        }

        if(e.key === 'd'){
            if(cameraX <= gridSize) {
                setCameraX(cameraX + 1)
            }
        }

        if(e.key === 'a'){
            if(cameraX >= -gridSize) {
                setCameraX(cameraX - 1)
            }
        }*/

        console.log(cameraX)
    }, [cameraZ, cameraX, gridSize])


    useFrame(() =>{
        controls.current.update();

        camera.position.z = cameraZ;
        camera.position.x = cameraX;
        camera.lookAt(cameraX, 0, camera.position.z)
    })


    React.useEffect(() => {
        window.addEventListener('keydown', handleUserKeyPress)

        return () => {
            window.removeEventListener('keydown', handleUserKeyPress);
        };
    }, [handleUserKeyPress, getCameraPosition, cameraY])

    return <orbitControls ref={controls} args={[camera, gl.domElement]} dampingFactor={0.8} rotateSpeed={0.7} />
}

function App() {
    const [coords, setCoords] = React.useState(new THREE.Vector2(0, 0));
    const [cameraPositionY, setCameraPositionY] = React.useState(15)
    const [gridScale, setGridScale] = React.useState(1)
    const [gridSize, setGridSize] = React.useState(32)

    const handleMouseMove = event => {
        event.preventDefault();
        const x = (((event.clientX / window.innerWidth) * 2 - 1) / 0.34 * cameraPositionY);
        const y = ((-(event.clientY / window.innerHeight) * 2 + 1) / 0.65 * cameraPositionY);
        const pos = new THREE.Vector2(x, y);
        setCoords(pos);
    };

    const handleGetScale = (scale, coords) => {
        setGridScale(scale)
    }

    const handleUserKeyPress = React.useCallback(e => {
        if(e.key === 'g')
            setGridSize(gridSize + 1)

        if(e.key === 'h'){
            setGridSize(gridSize - 1)
        }
    }, [gridSize])

    React.useEffect(() => {
        window.addEventListener('keydown', handleUserKeyPress)

        return () => {
            window.removeEventListener('keydown', handleUserKeyPress);
        };
    }, [handleUserKeyPress])


    return (
        <>
            <section onMouseMove={handleMouseMove} className='spline'>
                <Canvas
                    style={{background: "transparent", position: "fixed"}}
                    camera={{zoom: 1, position: [0, 15, 0], scale: 1}}>
                    <ambientLight intensity={1}/>

                    <Grid cameraPosition={cameraPositionY} gridSize={gridSize} getGridScale={(scale, coord) => handleGetScale(scale, coord)} mouseCoordinates={coords}/>

                    <Controls mouse={coords} gridSize={gridSize}/>
                    <Suspense fallback={null}>
                    </Suspense>
                </Canvas>
            </section>

            <p style={{position: "absolute", zIndex: 122, backgroundColor: "#ffffff"}}>x: {(coords.x / 2 / gridScale).toFixed(gridScale > 1 ? Math.log(gridScale) / Math.log(2) : 0)} y: {(coords.y / 2 / gridScale).toFixed(2)}</p>
            <p style={{position: "absolute", zIndex: 122, backgroundColor: "#ffffff", marginTop: 25}}>grid scale: {gridScale}</p>
            <p style={{position: "absolute", zIndex: 122, backgroundColor: "#ffffff", marginTop: 50}}>cameraY: {cameraPositionY}</p>
            <p style={{position: "absolute", zIndex: 122, backgroundColor: "#ffffff", marginTop: 75}}>grid Size: {gridSize}</p>

        </>
    );
}

export default App;
