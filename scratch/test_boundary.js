const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'sablonlar', 'sablon-kirmizi', 'page.tsx'), 'utf8');

function findTagBoundaries(content, signature) {
  const textIdx = content.indexOf(signature);
  console.log('signature index:', textIdx);
  if (textIdx === -1) return null;

  let startIdx = -1;
  let tagType = "";
  for (let i = textIdx; i >= 0; i--) {
    if (content.substring(i, i + 11) === "<motion.div") {
      startIdx = i;
      tagType = "motion.div";
      break;
    }
  }

  console.log('startIdx found:', startIdx, 'tagType:', tagType);
  if (startIdx === -1) return null;

  let openCount = 0;
  let endIdx = -1;
  const openPattern = new RegExp(`<${tagType.replace('.', '\\.')}(\\s|>)`);
  const closePattern = new RegExp(`</${tagType.replace('.', '\\.')}>`);

  let currentIdx = startIdx;
  while (currentIdx < content.length) {
    const remaining = content.substring(currentIdx);
    
    const nextOpenMatch = remaining.match(openPattern);
    const nextCloseMatch = remaining.match(closePattern);

    const openPos = nextOpenMatch ? currentIdx + nextOpenMatch.index : -1;
    const closePos = nextCloseMatch ? currentIdx + nextCloseMatch.index : -1;

    console.log(`currentIdx: ${currentIdx}, openCount: ${openCount}, openPos: ${openPos}, closePos: ${closePos}`);

    if (closePos === -1) {
      console.log('No closing tag found');
      break; 
    }

    if (openPos !== -1 && openPos < closePos) {
      openCount++;
      currentIdx = openPos + nextOpenMatch[0].length;
    } else {
      openCount--;
      if (openCount === 0) {
        endIdx = closePos + nextCloseMatch[0].length;
        break;
      }
      currentIdx = closePos + nextCloseMatch[0].length;
    }
  }

  console.log('endIdx found:', endIdx);
  return { startIdx, endIdx, tagType };
}

findTagBoundaries(content, "bence tıklamalısın");
