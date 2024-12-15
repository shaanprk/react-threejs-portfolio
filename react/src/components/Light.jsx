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
        // Flickering effect
        const interval = setInterval(() => {
            if (lightRef.current) {
                lightRef.current.intensity = 0.8 + Math.random() * 0.4;
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <pointLight
            ref={lightRef}
            position={[0, 4, 3]} // Adjust light position near bookshelf
            intensity={1} // Initial intensity
            distance={7} // How far the light reaches
            decay={0} // Rate of light decay
            color={'#ffa95c'} // Warm candlelight color
        />
    );
};

export default Light;