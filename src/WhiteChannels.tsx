import React from 'react';

interface WhiteChannelsProps {
    whiteWarm: number;
    whiteCool: number;
    onChange: (values: { whiteWarm?: number; whiteCool?: number }) => void;
}

export default function WhiteChannels({ whiteWarm, whiteCool, onChange }: WhiteChannelsProps) {
    return (
        <div data-testid="white-channels" className="field">
            <div className="field body">
                <div className="control">
                    <label className="label">Warm White</label>
                    <input
                        type="range"
                        min="0"
                        max="255"
                        value={whiteWarm}
                        onChange={(e) => onChange({ whiteWarm: parseInt(e.target.value, 10) })}
                        className="input"
                    />
                    <p className="help">{whiteWarm}</p>
                </div>
                <div className="control">
                    <label className="label">Cool White</label>
                    <input
                        type="range"
                        min="0"
                        max="255"
                        value={whiteCool}
                        onChange={(e) => onChange({ whiteCool: parseInt(e.target.value, 10) })}
                        className="input"
                    />
                    <p className="help">{whiteCool}</p>
                </div>
            </div>
        </div>
    );
}
