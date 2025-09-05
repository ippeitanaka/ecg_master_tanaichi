// 包括的な心電図アニメーションシステム

// SVGグリッドパターンを動的に追加
function addGridPattern(svg) {
    // 既存のdefsを確認、なければ作成
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.insertBefore(defs, svg.firstChild);
    }

    // グリッドパターンを追加
    const gridPattern = `
        <pattern id="grid-${Math.random().toString(36).substr(2, 9)}" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
        </pattern>
        <pattern id="grid-major-${Math.random().toString(36).substr(2, 9)}" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#d1d5db" stroke-width="1"/>
        </pattern>
    `;
    defs.innerHTML += gridPattern;
}

// 基本心電図アニメーター
class BasicECGAnimator {
    constructor(svgElement, waveformType = 'normal') {
        this.svg = svgElement;
        this.waveformType = waveformType;
        this.animationId = null;
        this.isRunning = false;
        this.width = 500;
        this.height = parseInt(svgElement.getAttribute('height')) || 100;
        this.centerY = this.height / 2;
        this.currentX = 20;
        this.speed = 2;
        this.scale = 1;
        
        this.setupSVG();
        this.waveforms = this.getWaveformData();
    }

    setupSVG() {
        // グリッドパターンを追加
        addGridPattern(this.svg);
        
        // 背景矩形を追加
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', '#fefefe');
        rect.setAttribute('stroke', '#e5e7eb');
        rect.setAttribute('stroke-width', '1');
        this.svg.appendChild(rect);
    }

    getWaveformData() {
        const patterns = {
            normal: {
                p: { amplitude: 15, width: 40, position: 0 },
                qrs: { amplitude: 50, width: 30, position: 80 },
                t: { amplitude: 20, width: 60, position: 160 },
                interval: 250,
                heartRate: 75
            },
            pac: {
                p: { amplitude: 20, width: 35, position: 0, abnormal: true },
                qrs: { amplitude: 45, width: 25, position: 60 },
                t: { amplitude: 18, width: 55, position: 130 },
                interval: 200,
                heartRate: 90
            },
            pvc: {
                p: { amplitude: 0, width: 0, position: 0 },
                qrs: { amplitude: 80, width: 80, position: 20, wide: true },
                t: { amplitude: -30, width: 70, position: 120, inverted: true },
                interval: 180,
                heartRate: 110
            },
            af: {
                fibrillation: true,
                qrs: { amplitude: 45, width: 25 },
                irregularRR: true,
                intervals: [150, 200, 180, 220, 160]
            },
            vt: {
                qrs: { amplitude: 70, width: 60, wide: true, rapid: true },
                interval: 120,
                heartRate: 200
            },
            stemi: {
                p: { amplitude: 12, width: 40, position: 0 },
                qrs: { amplitude: 45, width: 30, position: 80, qWave: true },
                st: { elevation: 15, position: 110 },
                t: { amplitude: 35, width: 60, position: 160, peaked: true },
                interval: 280
            },
            nstemi: {
                p: { amplitude: 12, width: 40, position: 0 },
                qrs: { amplitude: 45, width: 30, position: 80 },
                st: { depression: -8, position: 110 },
                t: { amplitude: -25, width: 60, position: 160, inverted: true },
                interval: 280
            },
            bradycardia: {
                p: { amplitude: 15, width: 40, position: 0 },
                qrs: { amplitude: 50, width: 30, position: 80 },
                t: { amplitude: 20, width: 60, position: 160 },
                interval: 400,
                heartRate: 45
            },
            avblock: {
                p: { amplitude: 15, width: 40, position: 0 },
                pr: { prolonged: true, interval: 120 },
                qrs: { amplitude: 50, width: 30, position: 120 },
                t: { amplitude: 20, width: 60, position: 200 },
                interval: 350
            }
        };
        
        return patterns[this.waveformType] || patterns.normal;
    }

    drawWaveform(startX) {
        const wave = this.waveforms;
        let pathData = `M ${startX} ${this.centerY}`;
        let currentX = startX;

        if (wave.fibrillation) {
            // 心房細動の不規則な波形
            return this.drawAtrialFibrillation(startX);
        }

        // P波
        if (wave.p && wave.p.amplitude > 0) {
            pathData += this.drawPWave(currentX + wave.p.position, wave.p);
        }

        // PR間隔（延長がある場合）
        if (wave.pr && wave.pr.prolonged) {
            currentX += wave.pr.interval;
            pathData += ` L ${currentX} ${this.centerY}`;
        }

        // QRS群
        if (wave.qrs) {
            const qrsX = currentX + (wave.qrs.position || 80);
            pathData += this.drawQRS(qrsX, wave.qrs);
            currentX = qrsX + wave.qrs.width;
        }

        // ST変化
        if (wave.st) {
            const stX = currentX + (wave.st.position || 20);
            const stY = this.centerY + (wave.st.elevation || wave.st.depression || 0);
            pathData += ` L ${stX} ${stY}`;
            currentX = stX + 30;
        }

        // T波
        if (wave.t) {
            const tX = currentX + (wave.t.position || 20);
            pathData += this.drawTWave(tX, wave.t);
        }

        return pathData;
    }

    drawPWave(x, pData) {
        const amplitude = pData.abnormal ? pData.amplitude * 1.3 : pData.amplitude;
        const color = pData.abnormal ? '#ef4444' : '#059669';
        
        return ` L ${x} ${this.centerY} 
                Q ${x + pData.width/3} ${this.centerY - amplitude} 
                ${x + pData.width*2/3} ${this.centerY - amplitude/2} 
                T ${x + pData.width} ${this.centerY}`;
    }

    drawQRS(x, qrsData) {
        let pathData = ` L ${x} ${this.centerY}`;
        
        if (qrsData.qWave) {
            pathData += ` L ${x + 5} ${this.centerY + 15}`;
        }
        
        if (qrsData.wide) {
            // 幅広QRS（VT、PVC）
            pathData += ` L ${x + 10} ${this.centerY + 10}
                         L ${x + 20} ${this.centerY - qrsData.amplitude}
                         L ${x + 40} ${this.centerY + qrsData.amplitude * 0.8}
                         L ${x + 60} ${this.centerY - 15}
                         L ${x + qrsData.width} ${this.centerY}`;
        } else {
            // 正常幅QRS
            pathData += ` L ${x + 5} ${this.centerY + 5}
                         L ${x + 10} ${this.centerY - qrsData.amplitude}
                         L ${x + 20} ${this.centerY + qrsData.amplitude * 0.6}
                         L ${x + qrsData.width} ${this.centerY}`;
        }
        
        return pathData;
    }

    drawTWave(x, tData) {
        const amplitude = tData.inverted ? -Math.abs(tData.amplitude) : tData.amplitude;
        const peakedness = tData.peaked ? 1.5 : 1;
        
        return ` L ${x} ${this.centerY}
                Q ${x + tData.width/3} ${this.centerY - amplitude * peakedness}
                ${x + tData.width*2/3} ${this.centerY - amplitude * 0.7}
                T ${x + tData.width} ${this.centerY}`;
    }

    drawAtrialFibrillation(startX) {
        let pathData = `M ${startX} ${this.centerY}`;
        
        // 不規則なf波
        for (let x = startX; x < startX + 200; x += 3) {
            const amplitude = (Math.random() - 0.5) * 8;
            pathData += ` L ${x} ${this.centerY + amplitude}`;
        }
        
        return pathData;
    }

    animate() {
        if (!this.isRunning) return;

        // 既存の波形をクリア（背景矩形以外）
        const paths = this.svg.querySelectorAll('path:not([d*="grid"])');
        paths.forEach(path => path.remove());

        // 新しい波形を描画
        const pathData = this.drawWaveform(this.currentX);
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', this.getWaveformColor());
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        
        this.svg.appendChild(path);

        // X座標を更新
        this.currentX += this.speed;
        
        // 画面端に達したらリセット
        if (this.currentX > this.width) {
            this.currentX = 20;
            // 少し待機してからリピート
            setTimeout(() => {
                if (this.isRunning) {
                    this.animate();
                }
            }, 1000);
            return;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    getWaveformColor() {
        const colors = {
            normal: '#059669',
            pac: '#f59e0b',
            pvc: '#ef4444',
            af: '#8b5cf6',
            vt: '#dc2626',
            stemi: '#dc2626',
            nstemi: '#f97316',
            bradycardia: '#3b82f6',
            avblock: '#6366f1'
        };
        return colors[this.waveformType] || '#059669';
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

// ページロード時に全ての心電図アニメーションを初期化
document.addEventListener('DOMContentLoaded', function() {
    // 各章のSVG要素を特定の波形タイプで初期化
    const chapterWaveforms = {
        'chapter1': 'normal',
        'chapter2': 'normal', 
        'chapter3': 'pac',
        'chapter4': 'af',
        'chapter5': 'bradycardia',
        'chapter6': 'avblock',
        'chapter7': 'stemi',
        'chapter8': 'normal',
        'chapter9': 'normal',
        'chapter10': 'normal'
    };

    // 各章のSVG要素を見つけてアニメーションを設定
    Object.keys(chapterWaveforms).forEach(chapterId => {
        const chapter = document.getElementById(chapterId);
        if (chapter) {
            const svgElements = chapter.querySelectorAll('svg');
            svgElements.forEach((svg, index) => {
                let waveformType = chapterWaveforms[chapterId];
                
                // 第3章の特別処理（複数の波形タイプ）
                if (chapterId === 'chapter3') {
                    const waveTypes = ['normal', 'pac', 'pvc'];
                    waveformType = waveTypes[index % waveTypes.length];
                }
                
                // 第4章の特別処理
                if (chapterId === 'chapter4') {
                    const waveTypes = ['af', 'af', 'vt'];
                    waveformType = waveTypes[index % waveTypes.length];
                }
                
                // 第7章の特別処理
                if (chapterId === 'chapter7') {
                    const waveTypes = ['stemi', 'nstemi'];
                    waveformType = waveTypes[index % waveTypes.length];
                }

                const animator = new BasicECGAnimator(svg, waveformType);
                
                // Intersection Observerで画面に表示されたときだけアニメーション
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            animator.start();
                        } else {
                            animator.stop();
                        }
                    });
                }, {
                    threshold: 0.1
                });
                
                observer.observe(svg);
            });
        }
    });
});
// SVG要素の修正
document.addEventListener('DOMContentLoaded', function() {
    // 全てのSVG要素を取得
    const allSvgs = document.querySelectorAll('svg');
    
    allSvgs.forEach(svg => {
        // 既存の内容をクリア（defs以外）
        const children = Array.from(svg.children);
        children.forEach(child => {
            if (child.tagName !== 'defs') {
                child.remove();
            }
        });
        
        // 基本的な属性を設定
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', svg.getAttribute('height') || '100');
        svg.setAttribute('viewBox', `0 0 500 ${svg.getAttribute('height') || '100'}`);
        svg.style.border = '1px solid #e5e7eb';
        svg.style.borderRadius = '4px';
        svg.style.backgroundColor = '#fefefe';
    });
});

// アニメーション管理システム
class AnimationManager {
    constructor() {
        this.animators = new Map();
        this.isInitialized = false;
    }

    initialize() {
        if (this.isInitialized) return;
        
        // 少し遅延させてDOM構築完了を確実にする
        setTimeout(() => {
            this.setupAnimations();
            this.isInitialized = true;
        }, 500);
    }

    setupAnimations() {
        // 各章の波形タイプマッピング
        const chapterWaveforms = {
            'chapter1': ['normal'],
            'chapter2': ['normal'], 
            'chapter3': ['normal', 'pac', 'pvc'],
            'chapter4': ['af', 'af', 'vt'],
            'chapter5': ['bradycardia'],
            'chapter6': ['avblock'],
            'chapter7': ['stemi', 'nstemi'],
            'chapter8': ['normal'],
            'chapter9': ['normal'],
            'chapter10': ['normal']
        };

        Object.keys(chapterWaveforms).forEach(chapterId => {
            const chapter = document.getElementById(chapterId);
            if (chapter) {
                const svgElements = chapter.querySelectorAll('svg');
                const waveTypes = chapterWaveforms[chapterId];
                
                svgElements.forEach((svg, index) => {
                    const waveformType = waveTypes[index % waveTypes.length];
                    const animatorId = `${chapterId}_${index}`;
                    
                    // 既存のアニメーターがあれば停止
                    if (this.animators.has(animatorId)) {
                        this.animators.get(animatorId).stop();
                    }
                    
                    // 新しいアニメーターを作成
                    const animator = new BasicECGAnimator(svg, waveformType);
                    this.animators.set(animatorId, animator);
                    
                    // Intersection Observerで制御
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            const container = entry.target.closest('.wave-container');
                            if (entry.isIntersecting) {
                                animator.start();
                                if (container) container.classList.add('animating');
                            } else {
                                animator.stop();
                                if (container) container.classList.remove('animating');
                            }
                        });
                    }, {
                        threshold: 0.1,
                        rootMargin: '50px'
                    });
                    
                    observer.observe(svg);
                });
            }
        });
    }

    stopAll() {
        this.animators.forEach(animator => animator.stop());
    }

    restartAll() {
        this.animators.forEach(animator => {
            animator.stop();
            setTimeout(() => animator.start(), 100);
        });
    }
}

// グローバルアニメーションマネージャー
window.ecgAnimationManager = new AnimationManager();

// 複数の初期化ポイントで確実に実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ecgAnimationManager.initialize();
    });
} else {
    window.ecgAnimationManager.initialize();
}

// ページ表示時にも実行
window.addEventListener('load', () => {
    setTimeout(() => {
        window.ecgAnimationManager.initialize();
    }, 1000);
});
