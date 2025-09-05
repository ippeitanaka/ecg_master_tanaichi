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

// 心房細動アニメーション
class AtrialFibrillationAnimator {
    constructor(svgElement) {
        this.svg = svgElement;
        this.animationId = null;
        this.isRunning = false;
        this.width = 500;
        this.height = 100;
        this.centerY = 50;
        this.currentX = 20;
        this.lastQRSTime = 0;
        this.nextQRSInterval = this.getRandomRRInterval();
    }

    getRandomRRInterval() {
        // 不規則なRR間隔（絶対性不整脈）
        return 100 + Math.random() * 150; // 100-250ms（画面上の単位）
    }

    generateFibWave(x) {
        // 細動波（f波）の生成
        const amplitude = 2 + Math.random() * 3;
        const frequency = 0.3 + Math.random() * 0.2;
        return this.centerY + amplitude * Math.sin(x * frequency) * (0.5 + Math.random() * 0.5);
    }

    drawQRS(x) {
        // 正常幅のQRS波形
        const points = [
            [x, this.centerY],
            [x + 5, this.centerY + 5],
            [x + 10, this.centerY - 25],
            [x + 25, this.centerY + 25],
            [x + 35, this.centerY],
        ];
        
        let pathData = `M ${points[0][0]} ${points[0][1]}`;
        for (let i = 1; i < points.length; i++) {
            pathData += ` L ${points[i][0]} ${points[i][1]}`;
        }
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('class', 'ecg-wave-abnormal');
        path.setAttribute('stroke-width', '2');
        this.svg.appendChild(path);
        
        return 35; // QRS幅
    }

    animate() {
        if (!this.isRunning) return;

        // 既存の波形をクリア
        const paths = this.svg.querySelectorAll('path:not([d*="grid"])');
        paths.forEach(path => path.remove());

        // 細動波を描画
        let pathData = `M 20 ${this.generateFibWave(20)}`;
        for (let x = 21; x <= this.currentX; x++) {
            pathData += ` L ${x} ${this.generateFibWave(x)}`;
        }

        const fibPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        fibPath.setAttribute('d', pathData);
        fibPath.setAttribute('class', 'ecg-wave-abnormal');
        fibPath.setAttribute('stroke-width', '1');
        this.svg.appendChild(fibPath);

        // QRS描画判定
        if (this.currentX - this.lastQRSTime >= this.nextQRSInterval) {
            const qrsWidth = this.drawQRS(this.currentX);
            this.lastQRSTime = this.currentX;
            this.currentX += qrsWidth;
            this.nextQRSInterval = this.getRandomRRInterval();
        }

        this.currentX += 2;

        if (this.currentX > this.width) {
            this.currentX = 20;
            this.lastQRSTime = 0;
            this.nextQRSInterval = this.getRandomRRInterval();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// 心室頻拍アニメーション
class VentricularTachycardiaAnimator {
    constructor(svgElement) {
        this.svg = svgElement;
        this.animationId = null;
        this.isRunning = false;
        this.width = 500;
        this.height = 100;
        this.centerY = 50;
        this.currentX = 20;
        this.qrsInterval = 70; // 高頻度（約200bpm相当）
        this.lastQRSTime = 0;
    }

    drawWideQRS(x) {
        // 幅広QRS（0.12秒以上）
        const points = [
            [x, this.centerY],
            [x + 10, this.centerY + 10],
            [x + 20, this.centerY - 30],
            [x + 40, this.centerY + 30],
            [x + 55, this.centerY - 10],
            [x + 70, this.centerY],
        ];
        
        let pathData = `M ${points[0][0]} ${points[0][1]}`;
        for (let i = 1; i < points.length; i++) {
            pathData += ` L ${points[i][0]} ${points[i][1]}`;
        }
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('class', 'ecg-wave-abnormal');
        path.setAttribute('stroke-width', '3');
        this.svg.appendChild(path);
        
        return 70; // 幅広QRS
    }

    animate() {
        if (!this.isRunning) return;

        // QRS描画判定
        if (this.currentX - this.lastQRSTime >= this.qrsInterval) {
            const qrsWidth = this.drawWideQRS(this.currentX);
            this.lastQRSTime = this.currentX;
            this.currentX += qrsWidth;
        } else {
            // 基線
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${this.currentX} ${this.centerY} L ${this.currentX + 2} ${this.centerY}`);
            path.setAttribute('class', 'ecg-wave');
            path.setAttribute('stroke-width', '1');
            this.svg.appendChild(path);
            this.currentX += 2;
        }

        if (this.currentX > this.width) {
            this.currentX = 20;
            this.lastQRSTime = 0;
            // 既存の波形をクリア
            const paths = this.svg.querySelectorAll('path:not([d*="grid"])');
            paths.forEach(path => path.remove());
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// アニメーションの初期化
document.addEventListener('DOMContentLoaded', function() {
    // 心房細動アニメーション
    const afSvgs = document.querySelectorAll('svg[viewBox*="500 100"]');
    afSvgs.forEach((svg, index) => {
        if (svg.closest('#chapter4')) {
            const animator = new AtrialFibrillationAnimator(svg);
            
            // インターセクションオブザーバーでアニメーション制御
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animator.start();
                    } else {
                        animator.stop();
                    }
                });
            });
            
            observer.observe(svg);
        }
    });

    // 心室頻拍アニメーション
    const vtSvgs = document.querySelectorAll('svg[viewBox*="500 100"]');
    vtSvgs.forEach((svg) => {
        if (svg.closest('#chapter4') && svg.parentElement.parentElement.querySelector('h4')?.textContent.includes('VTの心電図所見')) {
            const animator = new VentricularTachycardiaAnimator(svg);
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animator.start();
                    } else {
                        animator.stop();
                    }
                });
            });
            
            observer.observe(svg);
        }
    });
});
