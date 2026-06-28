const fs = require('fs');
const path = require('path');

const sablonlarDir = path.join(__dirname, '..', 'src', 'app', 'sablonlar');

const newAudioEffect = `  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (config.musicUrl) {
      audioRef.current = new Audio(config.musicUrl);
      audioRef.current.loop = true;

      const playAudio = () => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
              removeListeners();
            })
            .catch(() => {});
        }
      };

      const removeListeners = () => {
        window.removeEventListener("click", playAudio);
        window.removeEventListener("touchstart", playAudio);
        window.removeEventListener("scroll", playAudio);
      };

      // Try playing immediately
      playAudio();

      // Add listeners for interaction fallback
      window.addEventListener("click", playAudio);
      window.addEventListener("touchstart", playAudio);
      window.addEventListener("scroll", playAudio);

      return () => {
        removeListeners();
        audioRef.current?.pause();
      };
    }
  }, [config.musicUrl]);`;

function findTagBoundaries(content, signature) {
  const textIdx = content.indexOf(signature);
  if (textIdx === -1) return null;

  // Search backwards for the nearest "<motion.div"
  let startIdx = -1;
  let tagType = "";
  for (let i = textIdx; i >= 0; i--) {
    if (content.substring(i, i + 11) === "<motion.div") {
      startIdx = i;
      tagType = "motion.div";
      break;
    }
  }

  if (startIdx === -1) return null;

  // Search forwards from startIdx for the matching closing tag
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

    if (closePos === -1) break; // unmatched closing tag

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

  if (endIdx === -1) return null;
  return { startIdx, endIdx, tagType };
}

function findEffectBoundaries(content, signature) {
  const textIdx = content.indexOf(signature);
  if (textIdx === -1) return null;

  // Search backwards for the nearest "useEffect("
  let startIdx = -1;
  for (let i = textIdx; i >= 0; i--) {
    if (content.substring(i, i + 10) === "useEffect(") {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) return null;

  // Search forwards from startIdx for the end of the useEffect block: "}, [...]);" or "}, []);"
  let endIdx = -1;
  const remaining = content.substring(startIdx);
  const match = remaining.match(/\}\s*,\s*\[[^\]]*?\]\s*\);?/);
  if (match) {
    endIdx = startIdx + match.index + match[0].length;
  }

  if (endIdx === -1) return null;
  return { startIdx, endIdx };
}

function processFile(filePath) {
  console.log(`\nProcessing file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Find and remove countdown useEffect block
  const countdownEffectBoundaries = findEffectBoundaries(content, "setTimeout(() => setCountdown");
  if (countdownEffectBoundaries) {
    content = content.substring(0, countdownEffectBoundaries.startIdx) + content.substring(countdownEffectBoundaries.endIdx);
    console.log('  - Removed countdown useEffect block');
  }

  // 2. Remove countdown state declaration
  const countdownStateRegex = /const\s*\[\s*countdown\s*,\s*setCountdown\s*\]\s*=\s*useState\s*\(\s*\d+\s*\)\s*;?(\s*\/\/.*)?/g;
  const newContent = content.replace(countdownStateRegex, '');
  if (newContent !== content) {
    content = newContent;
    console.log('  - Removed countdown state declaration');
  }

  // 3. Replace Audio creation useEffect with interaction autoplay useEffect
  const audioEffectBoundaries = findEffectBoundaries(content, "new Audio(config.musicUrl)");
  if (audioEffectBoundaries) {
    content = content.substring(0, audioEffectBoundaries.startIdx) + newAudioEffect + content.substring(audioEffectBoundaries.endIdx);
    console.log('  - Replaced audio useEffect block with autoplay + interaction listeners');
  } else {
    console.log('  - Warning: could not find audio useEffect block');
  }

  // 4. Find and remove button container wrapper containing "bence tıklamalısın"
  const signature = "bence tıklamalısın";
  const boundaries = findTagBoundaries(content, signature);
  if (boundaries) {
    const { startIdx, endIdx, tagType } = boundaries;
    content = content.substring(0, startIdx) + content.substring(endIdx);
    console.log('  - Successfully removed button and text container wrapper');
  } else {
    console.log('  - Warning: could not find button container wrapper containing "bence tıklamalısın"');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  - File updated successfully!');
  } else {
    console.log('  - No changes made.');
  }
}

// Read all subdirectories in sablonlar
const files = fs.readdirSync(sablonlarDir);
for (const file of files) {
  const fullPath = path.join(sablonlarDir, file);
  if (fs.statSync(fullPath).isDirectory() && file.startsWith('sablon-')) {
    const pagePath = path.join(fullPath, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      processFile(pagePath);
    }
  }
}
console.log('\nAll done!');
