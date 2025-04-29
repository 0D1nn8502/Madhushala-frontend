import React, { createContext, useContext, useState, ReactNode } from 'react';


interface SpaceProviderProps {
    children: ReactNode; // Define children prop type
}

const SpaceContext = createContext<any>(null);

export const SpaceProvider: React.FC <SpaceProviderProps> = ({ children }) => {
    const [spaceData, setSpaceData] = useState<any>(null);

    return (
        <SpaceContext.Provider value={{ spaceData, setSpaceData }}>
            {children}
        </SpaceContext.Provider>
    );
};

export const useSpace = () => useContext(SpaceContext);
