// Instagram Reels supplied by LDMA on 2 November 2026.
// No trainee names, quotes, cohorts or outcomes are inferred from the URLs.
// Preserve original canonical Reel URLs for fallback if third-party embeds are blocked.
export const traineeReels=[
 'DX_Y2slP77l',
 'DUC8z8qjS8n',
 'DZzLZjgtTWQ',
 'DXZAgX9DVBC',
 'DXXZ4nLDfoz',
 'DWf1g7-iFBu',
 'DWQw6QMjcO3',
 'DWLxN7Fj4Vs',
 'DNxRdAS3lX6',
 'DCVqE4yv7-0',
 'DZzI0UUNYEQ'
].map((id,index)=>({
 id,
 number:String(index+1).padStart(2,'0'),
 url:'https://www.instagram.com/reel/'+id+'/',
 embedUrl:'https://www.instagram.com/reel/'+id+'/embed/'
}));
