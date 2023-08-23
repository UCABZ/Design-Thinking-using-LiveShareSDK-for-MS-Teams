/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the Microsoft Live Share SDK License.
 */

import * as Teams from "@microsoft/teams-js";
import { LiveShareClient, TestLiveShareHost, LiveState } from "@microsoft/live-share";
import {
    LiveCanvas,
} from "@microsoft/live-share-canvas";


import { svg_db } from './svg'
import * as Utils from "./utils";
import { View } from "./view";
import img1 from '../imgs/1.png'
import img2 from '../imgs/2.png'
import img3 from '../imgs/3.png'
import img4 from '../imgs/4.png'
import img6 from '../imgs/6.png'
import img7 from '../imgs/7.png'
import img8 from '../imgs/8.png'
import down from '../imgs/down.png'
import bg from '../imgs/bg.png'
/**
 * Other images
 * https:
 * https:
 */

const page = {
    p1: 'Storyboarding',
    p2: 'Experience-Based Roadmap'
}
const sle = e => document.querySelector(e)
const appTemplate = `
<div>
<div class="container">
    <div class="header">
        <div class="name">
            <span id="page-name">Storyboarding</span>
            <div>
                <img id="page-select" src=${down} alt="" />
                <div id="page">
                    <div id="p1">${page.p1}</div>
                    <div id="p2">${page.p2}</div>
                 </div>
            </div>
        </div>
        <div class="tool">
            <div class="item" id="sticker">
                <img src=${img1} alt=""  />
                <span >Sticker</span>
            </div>
            <div class="item" id="arrow">
                <img src=${img2} alt="" />
                <span >Arrow</span>
            </div>
            <div class="item" id="line">
                <img src=${img3} alt="" />
                <span >Line</span>
            </div>
            <div class="item" id="picture">
                <img src=${img4} alt="" />
                <span>Picture</span>
            </div>
            <div class="item" id="circle">
                <img src=${img7} alt="" />
                <span >circle</span>
            </div>
            <div class="item" id="rect">
                <img src=${img8} alt="" />
                <span >rectangle</span>
            </div>
            <div class="item" id="text">
                <img src=${img6} alt="" />
                <span>Text</span>
            </div>
        </div>
        <div class="config">
            <div>
                <span>Color</span>
                <input id="stroke-color"
                    type="color"
                ></input>
            </div>
            <div>
                <span>Line width</span>
                <select id="stroke-width" value="1" style="height:20px">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                </select>
            </div>
            <div>
                <span>Font size</span>
                <select id="stroke-font" value="14" style="height:20px">
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="22">22</option>
                    <option value="24">24</option>
                    <option value="26">26</option>
                    <option value="28">28</option>
                    <option value="30">30</option>
                    <option value="34">34</option>
                    <option value="38">38</option>
                    <option value="42">42</option>
                    <option value="46">46</option>
                    <option value="50">50</option>
                </select>
            </div>
            <div>
                <span>Font bold</span>
                <input id="fontWeight" type="checkbox" style="height:14px"></input>
            </div>
            <div>
                <span>italic</span>
                <input id="italic" type="checkbox" style="height:14px"></input>
            </div>
            <div>
                
                <button id="delete">Delete</button>
            </div>
            <div>
                <button id="touchDrawLog">Export</button>
            </div>
        </div>
    </div>
    <div class="tool-bar" style="display: none" }}>
        <div style="marginTop: 20px" }}>
        </div>
    </div>
    <div class="container-content">
        <div id="drawing-board"></div>
        <div id="content-wrap"></div>
    </div>
    <button id="moveUp">↑</button>
    <button id="moveDown">↓</button>
    <button id="moveLeft">←</button>
    <button id="moveRight">→</button>
    <button id="btnToggleCursorShare">Share cursor</button>
    <div id="add">+</div>
    <div id="subtract">-</div>
    <div id="display-max"></div>
    <input
      style="display: none"
      type="file"
      accept="image/*" 
      name="file"
      id="file"
    />
</div>
</div>`;

const containerSchema = {
    initialObjects: {
        page1State: LiveState,
        page2State: LiveState,
        liveCanvas: LiveCanvas,
        
    },
};
var editStroke
var editStrokeEl
let page1State;
let page2State;
let p1Data;
let p2Data;
let t = null
const timeList = new Set()

export class StageView extends View {
    _container;
    colorInputDom;
    curPage = page.p1;
    scale = 1;

    getLiveCanvas() {
        return this._container.initialObjects.liveCanvas;
    }

    moveView(dx, dy) {
        
        const currentTransform = sle('#drawing-board').style.transform;
        let currentX = 0;
        let currentY = 0;
        let currentScale = 1;
    
       
        const translateMatches = currentTransform.match(/translate\((-?\d+)px, (-?\d+)px\)/);
        if (translateMatches) {
            currentX = parseInt(translateMatches[1], 10);
            currentY = parseInt(translateMatches[2], 10);
        }
    
        
        const scaleMatches = currentTransform.match(/scale\(([\d.]+)\)/);
        if (scaleMatches) {
            currentScale = parseFloat(scaleMatches[1]);
        }
    
        
        const newX = currentX + dx;
        const newY = currentY + dy;
    
        
        sle('#drawing-board').style.transform = `translate(${newX}px, ${newY}px) scale(${currentScale})`;
    }

    constructor() {
        super();
        Utils.loadTemplate(appTemplate, document.body);
        this.colorInputDom = sle('#stroke-color')
        const setupButton = function (buttonId, onclick, event = 'onclick') {
            const button = document.getElementById(buttonId);
            if (button) {
                button[event] = onclick;
            }
        };

        setupButton("moveUp", () => this.moveView(0, 10));
        setupButton("moveDown", () => this.moveView(0, -10));
        setupButton("moveLeft", () => this.moveView(10, 0));
        setupButton("moveRight", () => this.moveView(-10, 0));

        setupButton("btnToggleCursorShare", () => {
            const liveCanvas = this.getLiveCanvas();
            const isCursorShared = liveCanvas.isCursorShared;

            liveCanvas.isCursorShared = !isCursorShared;

            const button = document.getElementById("btnToggleCursorShare");

            if (button) {
                button.innerText = liveCanvas.isCursorShared
                    ? "Stop sharing cursor"
                    : "Share cursor";
            }
        });

        setupButton("page-select", () => {
            sle("#page").style.display = sle("#page").style.display === 'block' ? 'none' : 'block'
        });

        setupButton("p1", () => {
            this.curPage = page.p1
            sle("#page").style.display = 'none'
            sle('#display-max').style.display = 'none'
            sle("#page-name").innerText = page.p1
            sle('#drawing-board').style.backgroundImage = `unset`
            svg_db.setStrokes(p1Data)
        });
        setupButton("p2", () => {
            this.curPage = page.p2
            sle("#page").style.display = 'none'
            sle('#display-max').style.display = 'block'
            sle("#page-name").innerText = page.p2
            sle('#drawing-board').style.backgroundImage = `url(${bg})`
            svg_db.setStrokes(p2Data)
        });

        setupButton("sticker", () => {
            this.setStrokeType('sticker')
        });
        setupButton("arrow", () => {
            this.setStrokeType('arrow')
        });
        setupButton("line", () => {
            this.setStrokeType('line')
        });
        setupButton("picture", () => {
            sle('#file').click()
        });
        
        setupButton("file", (e) => {
            let read = new FileReader()
            let file = e.target.files[0]
            read.readAsDataURL(file)
            read.onload = () => {
                svg_db.strokes.push(svg_db.drawStrokeCreate({ href: read.result, type: 'picture' }))
                svg_db.setStrokes(svg_db.strokes)
                e.target.value = ''
                this.setLiveState()
            }
        }, 'onchange');
        setupButton("circle", () => {
            this.setStrokeType('circle')
        });
        setupButton("rect", () => {
            this.setStrokeType('rect')
        });
        setupButton("text", () => {
            this.setStrokeType('text')
        });

        setupButton("stroke-color", (e) => {
            this.drawColorChange(e)
        }, 'onchange')

        setupButton("stroke-color", (e) => {
            e.stopPropagation()
            sle('#content-wrap').style.display = 'block'
        })

        setupButton("stroke-width", (e) => {
            
            if (editStroke) {
                
                editStroke.strokeWidth = Number(e.target.value)
                
                svg_db.reloadStroke(editStroke, editStrokeEl)
                this.setLiveState()
            } else {
                
                svg_db.option.strokeWidth = Number(e.target.value)
            }
        })
        setupButton("stroke-font", (e) => {
            
            if (editStroke) {
                
                if (editStroke.type === 'text') {
                    
                    editStroke.fontSize = Number(e.target.value)
                    
                    svg_db.reloadStroke(editStroke, editStrokeEl)
                    this.setLiveState()
                }
            } else {
                
                svg_db.option.fontSize = Number(e.target.value)
            }
        })
        setupButton("fontWeight", (e) => {
            
            if (editStroke) {
                
                if (editStroke.type === 'text') {
                    
                    editStroke.fontWeight = e.target.checked ? 800 : 400
                    
                    svg_db.reloadStroke(editStroke, editStrokeEl)
                    this.setLiveState()
                }
            } else {
                
                svg_db.option.fontWeight = e.target.checked ? 800 : 400
            }
        }, 'onchange')
        setupButton("italic", (e) => {
            
            if (editStroke) {
                
                if (editStroke.type === 'text') {
                    
                    editStroke.italic = e.target.checked
                    
                    svg_db.reloadStroke(editStroke, editStrokeEl)
                    this.setLiveState()
                }
            } else {
                
                svg_db.option.italic = e.target.checked
            }
        }, 'onchange')

        
        setupButton("delete", () => {
            if (!editStroke || !editStrokeEl) return
            svg_db.strokes.splice(svg_db.strokes.findIndex((e) => e.id === editStroke.id))
            editStrokeEl.remove()
            svg_db.mouseUpEventClear()
            svg_db.drawEditClear()
            this.setLiveState()
        })
        
        setupButton("touchDrawLog", () => {
            this.touchDrawLog()
        })

        
        setupButton('add', () => {
            this.scale += 0.2
            sle('#drawing-board').style.transform = `scale(${this.scale})`
        })
        
        setupButton('subtract', () => {
            this.scale -= 0.2
            sle('#drawing-board').style.transform = `scale(${this.scale})`
        })
    }

    
    setLiveState(data) {
        if (this.curPage === page.p1) {
            if (page1State)
                page1State.set(svg_db.strokes).then(() => {
                    
                    p1Data = svg_db.strokes
                    timeList.add(page1State._latestEvent.timestamp)
                })
        } else if (this.curPage === page.p2) {
            if (page2State)
                page2State.set(svg_db.strokes).then(() => {
                    
                    p2Data = svg_db.strokes
                    timeList.add(page2State._latestEvent.timestamp)
                })
        }
        if (t) clearTimeout(t)
        t = setTimeout(() => {
            timeList.clear()
            clearTimeout(t)
        }, 300)
        localStorage.setItem('svgData', JSON.stringify(svg_db.strokes));
    }

    
    copyToClip(content, message) {
        var aux = document.createElement("input");
        aux.setAttribute("value", content);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
        if (message == null) {
            alert("copied to the clipboard");
        } else {
            alert(message);
        }
    }
    
    touchDrawLog() {
        this.copyToClip(JSON.stringify(svg_db.strokes))
    }
    
    setStrokeType(type) {
        svg_db.setStrokeType(type)
        this.showOperation(type)
    }
    
    drawColorChange(e) {
        this.colorInputDom.value = e.target.value;
        if (editStroke) {
            editStroke.stroke = e.target.value
            svg_db.reloadStroke(editStroke, editStrokeEl)
            this.setLiveState()
        } else {
            svg_db.option.strokeColor = e.target.value
        }
    }
    
    showOperation(type) {
        const control = {
            color: sle('#stroke-color'),
            width: sle('#stroke-width'),
            font: sle('#stroke-font'),
            bold: sle('#fontWeight'),
            italic: sle('#italic')
        }
        const getS = el => el.parentNode.style;
        Object.keys(control).forEach(e => getS(control[e]).display = 'none')
        const { color, width, font, bold, italic } = control
        if (type === 'text') {
            getS(color).display = 'flex'
            getS(font).display = 'flex'
            getS(bold).display = 'flex'
            getS(italic).display = 'flex'
        } else if (type === 'arrow') {
            getS(color).display = 'flex'
        } else if (type === 'sticker' || type === 'picture') {

        } else {
            getS(color).display = 'flex'
            getS(width).display = 'flex'
        }
    }

    
    computedLevel() {
        if (this.curPage === page.p2) {
            const l1 = 0.3145;
            const l2 = 0.6751;
            const margin = 0.0015
            let l1Count = 0;
            let l2Count = 0;
            let l3Count = 0;

            svg_db.strokes.forEach(e => {
                if (e.minx < (l1 - margin) && e.maxx < (l1 - margin)) {
                    l1Count++
                } else if (e.minx > (l1) && e.maxx < (l2 - margin)) {
                    l2Count++
                } else if (e.minx > (l2) && e.maxx > (l2)) {
                    l3Count++
                }
            })
            let max = Math.max(...[l1Count, l2Count, l3Count])
            sle('#display-max').innerText = `The current trend is：${l1Count === max ? 'Near-Term' : ''} ${l2Count === max ? 'Mid-Term' : ''} ${l3Count === max ? 'Long-Term' : ''}`
        }
    }

    
    touchRegister() {
        const { clientHeight } = sle('body') || {}
        svg_db.register(document.getElementById('drawing-board'))
        svg_db.option.maxHeight = clientHeight
        this.setStrokeType('sticker')
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Control') {
                document.querySelectorAll('svg g[id^="sticker"]').forEach(e => e.style.pointerEvents = 'unset')
            }
        })
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Control') {
                document.querySelectorAll('svg g[id^="sticker"]').forEach(e => e.style.pointerEvents = 'none')
            }
        })

        window.addEventListener('click', (e) => {
            sle('#content-wrap').style.display = 'none'
        })

        editStroke = null
        editStrokeEl = null
        svg_db.selectStroke = (stroke, strokeEl) => {
            editStroke = stroke
            editStrokeEl = strokeEl
            if (editStroke) {
                this.colorInputDom.value = editStroke.stroke
            } else {
                this.colorInputDom.value = svg_db.option.strokeColor
            }
            var type = svg_db.option.strokeType
            if (editStroke) { type = editStroke.type }
            this.showOperation(type)
        }
        svg_db.strokeListener = () => {
            this.computedLevel()
            this.setLiveState()
        }
        svg_db.mousemove = (e) => {
            this.computedLevel()
            this.setLiveState()
        }
    }

    
    async internalStart() {
        const host = Utils.runningInTeams()
            ? Teams.LiveShareHost.create()
            : TestLiveShareHost.create();
        const client = new LiveShareClient(host);
        const { container } = await client.joinContainer(containerSchema);
        const { page1State: p1, page2State: p2 } = container.initialObjects;
        page1State = p1
        page2State = p2
        page1State.initialize({});
        page2State.initialize({});
        const updatePage1 = (data, self, session, timer) => {
            if (self || timeList.has(timer)) return
            
            p1Data = data
            if (this.curPage === page.p2) {
                return
            }
            timeList.add(timer)
            svg_db.setStrokes(data)
        };
        const updatePage2 = (data, self, session, timer) => {
            if (self || timeList.has(timer)) return
            
            p2Data = data
            if (this.curPage === page.p1) {
                return
            }
            timeList.add(timer)
            svg_db.setStrokes(data)
            this.computedLevel()
        };
        page1State.on("stateChanged", updatePage1);
        page2State.on("stateChanged", updatePage2);
        this.touchRegister()
        const savedData = JSON.parse(localStorage.getItem('svgData'));
        if (savedData) {
            svg_db.setStrokes(savedData);
        }
    }

    async start() {
        if (Utils.runningInTeams()) {
            await Teams.app.initialize();
            Teams.app.notifySuccess();
        }

        this.internalStart().catch((error) => {
            console.error(error);

            Utils.loadTemplate(
                `<div>Error: ${JSON.stringify(error)}</div>`,
                document.body
            );
        });
    }
}
