import React, { useRef, useEffect } from 'react';
import { PointLightHelper } from 'three';

const Light = () => {
    const lightRef = useRef();

    useEffect(() => {
        // Debugger
        if (lightRef.current) {
            const helper = new PointLightHelper(lightRef.current, 0.5, 0xffd700);
            lightRef.current.add(helper);
        }
    }, []);

    useEffect(() => {
        // Flickering
        const interval = setInterval(() => {
            if (lightRef.current) {
                lightRef.current.intensity = 0.8 + Math.random() * 0.4;
            }
        }, 100);
    }, []);

    return (
        <pointLight
            ref={lightRef}
            position={[0, 3, -1]} // Adjust light position near bookshelf
            intensity={1} // Initial intensity
            distance={5} // How far the light reaches
            decay={2} // Rate of light decay
            color={'#ffcc99'} // Warm candlelight color
        />
    );
};

export default Light;