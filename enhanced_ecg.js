// 高品質心電図アニメーション
class ECGAnimator {
    constructor() {
        this.isAnimating = false;
        this.animationSpeed = 1000;
        this.currentPhase = 0;
        this.setupRealTimeECG();
    }

    // リアルタイム心電図の設定
    setupRealTimeECG() {
        const containers = document.querySelectorAll('.wave-container');
        containers.forEach((container, index) => {
            if (!container.querySelector('.real-time-ecg')) {
                this.createRealTimeECG(container, index);
            }
        });
    }

    // リアルタイム心電図の作成
    createRealTimeECG(container, waveType = 0) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '120');
        svg.setAttribute('viewBox', '0 0 800 120');
        svg.classList.add('real-time-ecg');
        
        // グリッド背景
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', `grid-${waveType}`);
        pattern.setAttribute('width', '20');
        pattern.setAttribute('height', '20');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        
        const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect1.setAttribute('width', '20');
        rect1.setAttribute('height', '20');
        rect1.setAttribute('fill', 'none');
        rect1.setAttribute('stroke', '#ffcccb');
        rect1.setAttribute('stroke-width', '0.5');
        
        const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect2.setAttribute('width', '100');
        rect2.setAttribute('height', '100');
        rect2.setAttribute('fill', 'none');
        rect2.setAttribute('stroke', '#ff6b6b');
        rect2.setAttribute('stroke-width', '1');
        
        pattern.appendChild(rect1);
        pattern.appendChild(rect2);
        defs.appendChild(pattern);
        svg.appendChild(defs);
        
        // 背景
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '100%');
        background.setAttribute('height', '100%');
        background.setAttribute('fill', `url(#grid-${waveType})`);
        svg.appendChild(background);
        
        // 心電図線
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', waveType % 2 === 0 ? '#10b981' : '#ef4444');
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-linecap', 'round');
        path.classList.add('ecg-path');
        svg.appendChild(path);
        
        // パラメータ表示
        const paramGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        paramGroup.classList.add('ecg-parameters');
        
        const hrText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        hrText.setAttribute('x', '10');
        hrText.setAttribute('y', '20');
        hrText.setAttribute('fill', '#4a5568');
        hrText.setAttribute('font-size', '12');
        hrText.setAttribute('font-weight', 'bold');
        hrText.textContent = 'HR: 72 bpm';
        
        const rhythmText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rhythmText.setAttribute('x', '10');
        rhythmText.setAttribute('y', '35');
        rhythmText.setAttribute('fill', '#4a5568');
        rhythmText.setAttribute('font-size', '12');
        rhythmText.textContent = 'Rhythm: Sinus';
        
        paramGroup.appendChild(hrText);
        paramGroup.appendChild(rhythmText);
        svg.appendChild(paramGroup);
        
        // 既存のSVGを置き換え
        const existingSvg = container.querySelector('svg');
        if (existingSvg) {
            container.replaceChild(svg, existingSvg);
        } else {
            container.appendChild(svg);
        }
        
        this.animateWave(path, waveType);
    }

    // 波形データ生成
    generateWaveData(type, length = 800) {
        const data = [];
        const baselineY = 60;
        let x = 0;
        
        while (x < length) {
            if (type === 0) {
                // 正常洞調律
                data.push(...this.generateNormalBeat(x, baselineY));
                x += 160;
            } else if (type === 1) {
                // 心房細動
                data.push(...this.generateAFibBeat(x, baselineY));
                x += Math.random() * 40 + 120;
            } else if (type === 2) {
                // 心室頻拍
                data.push(...this.generateVTBeat(x, baselineY));
                x += 80;
            } else {
                // その他の不整脈
                data.push(...this.generateAbnormalBeat(x, baselineY));
                x += 140;
            }
        }
        
        return data;
    }

    // 正常な心拍生成
    generateNormalBeat(startX, baselineY) {
        const beat = [];
        
        // P波
        beat.push([startX, baselineY]);
        beat.push([startX + 10, baselineY - 3]);
        beat.push([startX + 20, baselineY]);
        beat.push([startX + 40, baselineY]);
        
        // QRS複合波
        beat.push([startX + 50, baselineY + 2]);  // Q波
        beat.push([startX + 55, baselineY - 25]); // R波
        beat.push([startX + 65, baselineY + 8]);  // S波
        beat.push([startX + 75, baselineY]);
        
        // T波
        beat.push([startX + 100, baselineY]);
        beat.push([startX + 115, baselineY - 8]);
        beat.push([startX + 130, baselineY]);
        beat.push([startX + 160, baselineY]);
        
        return beat;
    }

    // 心房細動波形生成
    generateAFibBeat(startX, baselineY) {
        const beat = [];
        let x = startX;
        
        // 不規則なf波
        while (x < startX + 40) {
            beat.push([x, baselineY + (Math.random() - 0.5) * 4]);
            x += 3;
        }
        
        // 不規則なQRS
        beat.push([startX + 45, baselineY + 2]);
        beat.push([startX + 50, baselineY - 20 + Math.random() * 5]);
        beat.push([startX + 60, baselineY + 6]);
        beat.push([startX + 70, baselineY]);
        
        // T波
        beat.push([startX + 90, baselineY - 5 + Math.random() * 3]);
        beat.push([startX + 110, baselineY]);
        
        return beat;
    }

    // 心室頻拍波形生成
    generateVTBeat(startX, baselineY) {
        const beat = [];
        
        // 幅広いQRS
        beat.push([startX, baselineY]);
        beat.push([startX + 5, baselineY + 3]);
        beat.push([startX + 15, baselineY - 20]);
        beat.push([startX + 25, baselineY + 15]);
        beat.push([startX + 35, baselineY - 10]);
        beat.push([startX + 45, baselineY + 8]);
        beat.push([startX + 55, baselineY]);
        beat.push([startX + 80, baselineY]);
        
        return beat;
    }

    // その他の異常波形生成
    generateAbnormalBeat(startX, baselineY) {
        const beat = [];
        
        // 変形したP波
        beat.push([startX, baselineY]);
        beat.push([startX + 15, baselineY - 5]);
        beat.push([startX + 25, baselineY]);
        beat.push([startX + 40, baselineY]);
        
        // 異常QRS
        beat.push([startX + 50, baselineY + 3]);
        beat.push([startX + 60, baselineY - 22]);
        beat.push([startX + 70, baselineY + 10]);
        beat.push([startX + 80, baselineY]);
        
        // 異常T波
        beat.push([startX + 100, baselineY]);
        beat.push([startX + 120, baselineY + 8]);
        beat.push([startX + 140, baselineY]);
        
        return beat;
    }

    // 波形アニメーション
    animateWave(path, type) {
        const waveData = this.generateWaveData(type);
        let currentIndex = 0;
        
        const animate = () => {
            if (currentIndex < waveData.length) {
                const currentData = waveData.slice(0, currentIndex + 1);
                const pathString = this.createPathString(currentData);
                path.setAttribute('d', pathString);
                
                currentIndex += 2;
                setTimeout(() => requestAnimationFrame(animate), 50);
            } else {
                // アニメーション完了後、再開始
                setTimeout(() => {
                    currentIndex = 0;
                    animate();
                }, 5000);
            }
        };
        
        animate();
    }

    // パス文字列作成
    createPathString(data) {
        if (data.length === 0) return '';
        
        let pathString = `M ${data[0][0]} ${data[0][1]}`;
        for (let i = 1; i < data.length; i++) {
            pathString += ` L ${data[i][0]} ${data[i][1]}`;
        }
        
        return pathString;
    }

    // 従来の静的波形もアニメーション
    animateStaticWaves() {
        const waves = document.querySelectorAll('.ecg-wave, .ecg-wave-abnormal');
        waves.forEach((wave, index) => {
            setTimeout(() => {
                const length = wave.getTotalLength();
                wave.style.strokeDasharray = length;
                wave.style.strokeDashoffset = length;
                wave.style.animation = 'dash 2s ease-in-out';
            }, index * 300);
        });
    }
}
