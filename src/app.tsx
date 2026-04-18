import { RouterProvider } from 'react-router-dom'

import { router } from './routes'

export default function App() {
  return <RouterProvider router={router} />
}
import React, { useState, useEffect } from 'react';
import { Translation, UserContribution, MemoryPoint, Language } from '../types';
import * as d3 from 'd3';

interface Props {
  t: Translation;
  contribution: UserContribution;
  memories: MemoryPoint[];
  lang: Language;
}

const Zone4_Printer: React.FC<Props> = ({ t, contribution, memories, lang }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState('');

  useEffect(() => {
    const svg = d3.select('#blueprint-svg');
    svg.selectAll('*').remove();
    
    const width = 400;
    const height = 450; 

    // Draw grid - Use strictly black dashed lines
    const grid = svg.append('g').attr('class', 'grid');
    d3.range(0, width + 40, 40).forEach(d => {
      grid.append('line')
          .attr('x1', d).attr('y1', 0).attr('x2', d).attr('y2', height - 50)
          .attr('stroke', '#000').attr('stroke-width', 0.5).attr('stroke-dasharray', '1,3');
    });
    d3.range(0, height - 10, 40).forEach(d => {
      grid.append('line')
          .attr('x1', 0).attr('y1', d).attr('x2', width).attr('y2', d)
          .attr('stroke', '#000').attr('stroke-width', 0.5).attr('stroke-dasharray', '1,3');
    });

    // Draw nodes - Thicker for visibility
    const g = svg.append('g');
    const margin = 50;
    const plotSize = width - (margin * 2);

    memories.forEach((m, i) => {
      const cx = margin + (m.x / 100) * plotSize;
      const cy = margin + (m.y / 100) * plotSize;

      // Outer circle
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 3 + m.intensity * 8)
        .attr('fill', 'none').attr('stroke', '#000').attr('stroke-width', 1.5);
      
      // Inner dot
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 2)
        .attr('fill', '#000');

      if (i > 0) {
        const prev = memories[i - 1];
        g.append('line')
          .attr('x1', margin + (prev.x / 100) * plotSize).attr('y1', margin + (prev.y / 100) * plotSize)
          .attr('x2', cx).attr('y2', cy)
          .attr('stroke', '#000').attr('stroke-width', 1);
      }
    });

    // Metadata Placement - Bold for thermal
    const fontMono = '"Space Mono", monospace';

    // Top Header
    svg.append('text')
       .attr('x', width/2)
       .attr('y', -10)
       .attr('text-anchor', 'middle')
       .attr('fill', '#000')
       .style('font-weight', '900')
       .style('font-size', '16px')
       .style('font-family', 'serif')
       .text('MNEMONIC ML OUTPUT');
    
    svg.append('line').attr('x1', 0).attr('y1', 0).attr('x2', width).attr('y2', 0)
       .attr('stroke', '#000').attr('stroke-width', 2);

    // Footer divider
    svg.append('line').attr('x1', 0).attr('y1', height - 40).attr('x2', width).attr('y2', height - 40)
       .attr('stroke', '#000').attr('stroke-width', 2);

    // Metadata
    svg.append('text')
       .attr('x', 0)
       .attr('y', height - 25)
       .attr('fill', '#000')
       .style('font-size', '10px')
       .style('font-family', fontMono)
       .style('font-weight', 'bold')
       .text(`SESSION ID: ${contribution.timestamp.toString(16).toUpperCase()}`);
    
    svg.append('text')
       .attr('x', 0)
       .attr('y', height - 10)
       .attr('fill', '#000')
       .style('font-size', '10px')
       .style('font-family', fontMono)
       .style('font-weight', 'bold')
       .text(`STATIONS: ${contribution.spatialNodes}N / ${contribution.permutations.length}P`);

    svg.append('text')
       .attr('x', width)
       .attr('y', height - 25)
       .attr('text-anchor', 'end')
       .attr('fill', '#000')
       .style('font-size', '10px')
       .style('font-family', fontMono)
       .style('font-weight', 'bold')
       .text(`ARCHETYPE: ${contribution.archetypeId || 'UNKNOWN'}`);

    svg.append('text')
       .attr('x', width)
       .attr('y', height - 10)
       .attr('text-anchor', 'end')
       .attr('fill', '#000')
       .style('font-size', '10px')
       .style('font-family', fontMono)
       .style('font-weight', 'bold')
       .text(`RESONANCE: ${contribution.resonanceScore || 0}%`);

    // Add a Small QR Placeholder or decorative barcode
    for(let x=0; x<width; x+=10) {
        svg.append('rect').attr('x', x).attr('y', height - 5).attr('width', 2).attr('height', 5).attr('fill', '#000');
    }

  }, [memories, contribution, t]);

  const handleDirectPrint = async () => {
    const bluetooth = (navigator as any).bluetooth;
    if (!bluetooth) {
      alert('Bluetooth not supported. Please use Bluefy browser on iOS/iPad.');
      return;
    }

    try {
      setIsPrinting(true);
      setPrintStatus('SEARCHING...');

      const device = await bluetooth.requestDevice({
        filters: [
          { namePrefix: 'ITPP' },
          { namePrefix: 'P130' }
        ],
        optionalServices: ['0000ff00-0000-1000-8000-00805f9b34fb']
      });

      setPrintStatus('CONNECTING...');
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('0000ff00-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('0000ff02-0000-1000-8000-00805f9b34fb');

      setPrintStatus('FORMATTING...');
      
      const encoder = new TextEncoder();
      
      const commands: number[] = [];
      const add = (arr: number[]) => commands.push(...arr);
      const addText = (text: string) => commands.push(...Array.from(encoder.encode(text)));

      // ESC/POS Initialization
      add([0x1B, 0x40]); // Initialize
      add([0x1B, 0x61, 0x01]); // Align Center
      add([0x1B, 0x45, 0x01]); // Bold ON
      addText('MNEMONIC ML OUTPUT\n');
      add([0x1B, 0x45, 0x00]); // Bold OFF
      addText('--------------------------------\n\n');
      
      add([0x1B, 0x61, 0x00]); // Align Left
      addText(`SESSION ID: ${contribution.timestamp.toString(16).toUpperCase()}\n`);
      addText(`ARCHETYPE: ${contribution.archetypeId || 'UNKNOWN'}\n`);
      addText(`RESONANCE: ${contribution.resonanceScore || 0}%\n`);
      addText(`STATIONS: ${contribution.spatialNodes}N / ${contribution.permutations.length}P\n`);
      
      addText('\nMEMORY PATH:\n');
      memories.forEach((m, i) => {
        addText(`[${i}] X:${Math.round(m.x)} Y:${Math.round(m.y)} INT:${m.intensity}\n`);
      });

      // Feeds for tear-off
      addText('\n\n\n\n\n');
      add([0x1D, 0x56, 0x42, 0x00]); // Feed & Cut (Tear-off position)

      const finalBuffer = new Uint8Array(commands);

      setPrintStatus('SENDING...');
      
      // CRITICAL: Chunking logic for iPad Bluetooth stability
      const CHUNK_SIZE = 20; 
      for (let i = 0; i < finalBuffer.length; i += CHUNK_SIZE) {
        const chunk = finalBuffer.slice(i, i + CHUNK_SIZE);
        await characteristic.writeValue(chunk);
        // Small delay to prevent buffer overflow on thermal printer
        await new Promise(r => setTimeout(r, 25));
      }

      setPrintStatus('PRINT SUCCESS');
      setTimeout(() => {
        setIsPrinting(false);
        setPrintStatus('');
      }, 2000);

      await server.disconnect();
    } catch (error) {
      console.error('Bluetooth Error:', error);
      alert('Print Error: ' + (error as Error).message);
      setIsPrinting(false);
      setPrintStatus('');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="print-only-container">
        <svg id="blueprint-svg" viewBox="-20 -40 440 500" width="400" height="400" className="bg-white" />
      </div>

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 no-print">
        <div className="flex justify-between items-center mb-6">
            <div className="text-left">
                <div className="text-[10px] mono opacity-40 uppercase tracking-[0.2em] mb-1">{t.label_printer_status}</div>
                <div className="text-sm font-light flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    <span className="mono text-xs text-cyan-500/80">{isPrinting ? printStatus : 'P130B_BLE_READY'}</span>
                </div>
            </div>
            <button 
                onClick={handleDirectPrint} 
                disabled={isPrinting}
                className="group relative overflow-hidden px-8 py-3 border border-white/20 hover:border-white text-white transition-all uppercase tracking-[0.3em] text-[10px] bg-black"
            >
                <span className="relative z-10">{isPrinting ? printStatus : "PRINT TO P130B"}</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="absolute inset-0 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    BLUETOOTH PRINT
                </span>
            </button>
        </div>
        
        <div className="pt-4 border-t border-zinc-800 mt-4">
            <p className="text-[9px] mono opacity-30 leading-relaxed uppercase tracking-widest">
                INTERFACE: WEB_BLUETOOTH / BLUEFY<br/>
                HW: MUNBYN P130B THERMAL<br/>
                MODE: CHUNKED_STREAMING (20B)
            </p>
        </div>
      </div>
    </div>
  );
};

export default Zone4_Printer;

