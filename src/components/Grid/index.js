import React from "react";
import * as THREE from 'three';
import {Html} from '@react-three/drei'



function Grid({mouseCoordinates, getGridScale, cameraPosition, gridSize}) {
    const ref = React.useRef()

    const position_x = []
    const coordinatePointsX = []
    const [pointsArr, setPointsArr] = React.useState([]);
    const [gridScale, setGridScale] = React.useState(1)
    const [pickerCoordinates, setPickerCoordinates] = React.useState({x: 0, y: 0})
    const [pointsArrScaled, setPointsArrScaled] = React.useState([])
    const [cubicArr, setCubicArr] = React.useState([])
    const [showLines, setShowLines] = React.useState(true)

    const handleGetMouseCoord = () => {
        const pointCoordinates = {x: pickerCoordinates.x / gridScale, y: pickerCoordinates.y / gridScale}
        const pointCoordWithScale = {x: pickerCoordinates.x / gridScale, y: pickerCoordinates.y / gridScale}

        setPointsArrScaled([...pointsArrScaled, pointCoordWithScale])
        setPointsArr([...pointsArr, pointCoordinates])
    }

    for(let i = -gridSize; i <= gridSize; i += 1){
        position_x.push(i)
        coordinatePointsX.push(i)
    }

    console.log(pointsArrScaled)

    const handleUserKeyPress = React.useCallback(e => {
        if(e.key === '-'){
            if(gridScale !== 8)
                setGridScale(gridScale * 2)
        }
        if(e.key === '='){
            if(gridScale !== 0.125)
                setGridScale(gridScale / 2)
        }

        if(e.key === 'Backspace'){
            let newPoints = [...pointsArr]
            newPoints.splice(pointsArr.length - 1, 1)
            setPointsArr(newPoints)
        }

        if(e.key === 'f'){
            setPointsArr([])
        }

        if(e.key === 'n')
            setShowLines(!showLines)

    }, [gridScale, pointsArr, showLines])

    React.useEffect(() => {
        getGridScale(gridScale, pickerCoordinates.x)
    }, [gridScale, getGridScale, pickerCoordinates])

    React.useEffect(() => {
        window.addEventListener('keydown', handleUserKeyPress)

        return () => {
            window.removeEventListener('keydown', handleUserKeyPress);
        };
    }, [handleUserKeyPress])

    React.useEffect(() => {
        let picker = {x: Math.round(mouseCoordinates.x / 2 + cameraPosition.x), y: Math.round(mouseCoordinates.y / 2 - cameraPosition.z)}

        setPickerCoordinates(picker)
    }, [mouseCoordinates, cameraPosition.x, cameraPosition.z])

    const readSpline = (koeff, t, d) => {
        let result = {x: null, y: null}
        let t2, t3

        t2 = t * t
        t3 = t2 * t

        result.x = (koeff[0].x * t3 + koeff[1].x * t2 + koeff[2].x * t + koeff[3].x) / d
        result.y = (koeff[0].y * t3 + koeff[1].y * t2 + koeff[2].y * t + koeff[3].y) / d

        return result
    }

    React.useEffect(() => {
        if(pointsArr.length > 3)
            CalcSpline()
    }, [pointsArr])

    const CalcSpline = () => {
        let cubic = []
        let ht = 8; //number of t
        let newPoints = []

        for(let i = 0; i < pointsArr.length; i++){
            newPoints.push(pointsArr[i])
        }
        newPoints.push(pointsArr[1])
        newPoints.push(pointsArr[2])
        newPoints.push(pointsArr[3])

        let r = {x: null, y: null}

        for(let i = 1; i < newPoints.length - 2; i++){
            let newkfx = null
            let newkfy = null
            let kf = []

            newkfx = -newPoints[i - 1].x + 3 * newPoints[i].x - 3 * newPoints[i + 1].x + newPoints[i + 2].x
            newkfy = -newPoints[i - 1].y + 3 * newPoints[i].y - 3 * newPoints[i + 1].y + newPoints[i + 2].y
            kf.push({x: newkfx, y: newkfy})

            newkfx = 3 * newPoints[i - 1].x - 6 * newPoints[i].x + 3 * newPoints[i + 1].x
            newkfy = 3 * newPoints[i - 1].y - 6 * newPoints[i].y + 3 * newPoints[i + 1].y
            kf.push({x: newkfx, y: newkfy})

            newkfx = -3 * newPoints[i - 1].x + 3 * newPoints[i + 1].x
            newkfy = -3 * newPoints[i - 1].y + 3 * newPoints[i + 1].y
            kf.push({x: newkfx, y: newkfy})

            newkfx = newPoints[i - 1].x + 4 * newPoints[i].x + newPoints[i + 1].x
            newkfy = newPoints[i - 1].y + 4 * newPoints[i].y + newPoints[i + 1].y
            kf.push({x: newkfx, y: newkfy})

            for(let j = 0; j < ht; j++){
                r = readSpline(kf, j / ht, 6.0)
                cubic.push(r)
            }
        }

        setCubicArr(cubic)
    }


    const drawSpline = () => {
        let splineLines = []

        for(let i = 0; i < cubicArr.length - 2; i++){
            splineLines.push(<group position={[0, 0, 0]}>
                <line
                    key={cubicArr[i].x}
                    geometry={new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(cubicArr[i].x * gridScale, 0.01, -cubicArr[i].y * gridScale), new THREE.Vector3(cubicArr[i + 1].x * gridScale, 0.01, -cubicArr[i + 1].y * gridScale)])}>
                    <lineBasicMaterial attach="material" color={'#008000'} linewidth={1} linecap={'round'}
                                       linejoin={'round'}/>
                </line>
            </group>)
        }

        return splineLines
    }

    const drawLines = () => {
        let lines = []
        for(let i = 0; i < pointsArr.length - 1; i++){
            lines.push(<group position={[0, 0, 0]}>
                <line
                    key={pointsArr[i].x}
                    geometry={new THREE.BufferGeometry().setFromPoints([new THREE.Vector3((pointsArr[i].x) * gridScale, 0.01, -pointsArr[i].y * gridScale), new THREE.Vector3(pointsArr[i + 1].x * gridScale, 0.01, -(pointsArr[i + 1].y) * gridScale)])}>
                    <lineBasicMaterial attach="material" color={'#008000'} linewidth={1} linecap={'round'}
                                       linejoin={'round'}/>
                </line>
            </group>)
        }

        return lines;
    }

    return (

        <group onPointerDown={handleGetMouseCoord} ref={ref}>
            {position_x.map((p) => <group key={p} position={[0, 0, p]}>
                <line
                    geometry={new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-gridSize, 0, 0), new THREE.Vector3(gridSize, 0, 0)])}>
                    <lineBasicMaterial attach="material" color={'#989898'} linewidth={1} linecap={'round'}
                                       linejoin={'round'}/>
                </line>
            </group>) }

            {position_x.map((p) => <group key={p} position={[p, 0, 0]}>
                <line
                    geometry={new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -gridSize), new THREE.Vector3(0, 0, gridSize)])}>
                    <lineBasicMaterial attach="material" color={'#989898'} linewidth={1} linecap={'round'}
                                       linejoin={'round'}/>
                </line>
            </group>) }

            <group position={[0, 0, 0]}>
                <line
                    geometry={new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.01, -gridSize), new THREE.Vector3(0, 0.01, gridSize)])}>
                    <lineBasicMaterial attach="material" color={'#ff0000'} linewidth={1} linecap={'round'}
                                       linejoin={'round'}/>
                </line>
            </group>

            <group position={[0, 0, 0]}>
                <line
                    geometry={new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-gridSize, 0.01, 0), new THREE.Vector3(gridSize, 0.01, 0)])}>
                    <lineBasicMaterial attach="material" color={'#ff0000'} linewidth={1} linecap={'round'}
                                       linejoin={'round'}/>
                </line>
            </group>

            <group>
                <mesh position={[pickerCoordinates.x, 0.1, -pickerCoordinates.y]}  rotation={[-1.55, 0, 0]}>
                    <circleBufferGeometry args={[0.1, 30]}  attach="geometry" />
                    <meshBasicMaterial color="red" attach="material" />
                </mesh>
            </group>

            {pointsArr.map((p) => <mesh key={p} position={[p.x * gridScale, 0.1, -p.y* gridScale]} rotation={[-1.55, 0, 0]}>
                <circleBufferGeometry args={[0.1, 30]} attach="geometry"/>
                <meshBasicMaterial color="blue" attach="material"/>
            </mesh>)}



            {coordinatePointsX.map((p) => <group key={p} position={[p, 0.2, 0.3]}>
                <Html center scaleFactor={10}>
                    <div style={{color: 'black', fontFamily: 'Fredoka One', fontSize: 15 / (cameraPosition.y / 15)}}>{p / gridScale}</div>
                </Html>
            </group>) }

            {coordinatePointsX.map((p) => <group key={p} position={[0.3, 0.2, p]}>
                <Html center scaleFactor={10}>
                    <div style={{color: 'black', fontFamily: 'Fredoka One', fontSize: 15 / (cameraPosition.y / 15)}}>{(p / gridScale) * -1}</div>
                </Html>
            </group>) }



            {showLines && pointsArr.length > 2 && drawLines()}
            {pointsArr.length > 3 && drawSpline()}


        </group>
    )
}

export default Grid
