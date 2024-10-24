"use client";

import React, { useEffect, useRef, useState } from 'react';
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';

let detectInterval;

const ObjectDetection = () => {
    const [isLoading, setIsLoading] = useState(true);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    // Function to render predictions on the canvas
    function renderPredictions(predictions, ctx) {
        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox; // bounding box

            // Set styling
            ctx.strokeStyle = "#00FFFF"; // bounding box color
            ctx.lineWidth = 2; // bounding box thickness
            ctx.font = "18px Arial"; // label font
            ctx.fillStyle = "#FF00FF"; // label color

            // Draw bounding box
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.stroke();

            // Draw label
            ctx.fillText(
                `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
                x,
                y > 10 ? y - 5 : 10
            );
        });
    }

    // Function to run object detection
    async function runObjectDetection(net) {
        if (
            canvasRef.current &&
            webcamRef.current !== null &&
            webcamRef.current.video?.readyState === 4
        ) {
            canvasRef.current.width = webcamRef.current.video.videoWidth;
            canvasRef.current.height = webcamRef.current.video.videoHeight;

            const detectedObjects = await net.detect(webcamRef.current.video, undefined, 0.6);
            const context = canvasRef.current.getContext("2d");

            // Call renderPredictions to draw boxes and labels
            renderPredictions(detectedObjects, context);
        }
    }

    const runCoco = async () => {
        setIsLoading(true);
        const net = await cocoSSDLoad();
        setIsLoading(false);
        detectInterval = setInterval(() => {
            runObjectDetection(net);
        }, 10);
    };

    const showMyVideo = () => {
        if (webcamRef.current !== null && webcamRef.current.video?.readyState === 4) {
            const myVideoWidth = webcamRef.current.video.videoWidth;
            const myVideoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = myVideoWidth;
            webcamRef.current.video.height = myVideoHeight;
        }
    };

    useEffect(() => {
        runCoco();
        showMyVideo();
        return () => clearInterval(detectInterval); 
    }, []);

    return (
        <div className="mt-8">
            {isLoading ? (
                <div className="gradient-text">Loading AI Model...</div>
            ) : (
                <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
                    {/* webcam */}
                    <Webcam
                        ref={webcamRef}
                        className="rounded-md w-full lg:h-[720px]"
                        muted
                    />
                    {/* canvas */}
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
                    />
                </div>
            )}
        </div>
    );
};

export default ObjectDetection;
