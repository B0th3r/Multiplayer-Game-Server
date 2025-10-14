import { indexToName } from '../../../shared/mahjong.js';
import { urlForTileIndex } from '../lib/tileAssets.js';

export default function Tile({ index, masked=false, size=48, className='', onClick }) {
  const w = size, h = Math.round(size*1.5);
  if (masked || index == null || index < 0) {
    return <div className={`rounded-lg bg-slate-800/80 border border-slate-600 ${className}`} style={{width:w, height:h}} />;
  }
  const url = urlForTileIndex(index);
  const alt = indexToName(index);
  return (
    <button onClick={onClick} className={className} style={{width:w, height:h}}>
      <img src={url} width={w} height={h} alt={alt}
           style={{display:'block', borderRadius:8, border:'1px solid rgba(100,116,139,.6)'}}/>
    </button>
  );
}
