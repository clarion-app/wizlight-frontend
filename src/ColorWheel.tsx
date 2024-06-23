// ColorWheel.tsx
import React, { useState, useRef, useEffect, MouseEvent } from 'react';

interface ColorWheelProps {
  changeColor: (color: string) => void;
  initialColor?: string;
}

const ColorWheel: React.FC<ColorWheelProps> = ({ changeColor, initialColor = '#ffffff' }) => {
  const [color, setColor] = useState<string>(initialColor);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const radius = canvas.width / 2;
        const centerRadius = radius / 3;
        const toRad = (deg: number) => (deg * Math.PI) / 180;

        for (let angle = 0; angle < 360; angle++) {
          const startAngle = toRad(angle);
          const endAngle = toRad(angle + 1);
          ctx.beginPath();
          ctx.moveTo(radius, radius);
          ctx.arc(radius, radius, radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(radius, radius, centerRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
  }, []);

  const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const radius = canvas.width / 2;
        const centerRadius = radius / 10;
        const distanceFromCenter = Math.sqrt(Math.pow(x - radius, 2) + Math.pow(y - radius, 2));

        if (distanceFromCenter <= centerRadius) {
          setColor('#ffffff');
          changeColor('#ffffff');
        } else {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          const hexColor = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
          setColor(hexColor);
          changeColor(hexColor);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="cursor-pointer rounded-full shadow-lg"
        onClick={handleClick}
      ></canvas>
      <input
        type="text"
        value={color}
        readOnly
        className="mt-4 p-2 border rounded-md text-center"
      />
    </div>
  );
};

export default ColorWheel;
