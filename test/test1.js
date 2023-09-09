const { expect } = require('chai');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

describe('moveView', () => {
    let moveView;
    let dom;
    let sle;

    beforeEach(() => {
        dom = new JSDOM(`
            <html>
                <body>
                    <div id="drawing-board"></div>
                </body>
            </html>
        `);

        global.document = dom.window.document;

        sle = (selector) => global.document.querySelector(selector);

    
        moveView = (dx, dy) => {
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
        };
    });

    it('should correctly move the view when no transform is present', () => {
        moveView(10, 20);
        const resultTransform = sle('#drawing-board').style.transform;
        expect(resultTransform).to.equal('translate(10px, 20px) scale(1)');
    });

    it('should correctly move the view when a transform is present', () => {
        sle('#drawing-board').style.transform = 'translate(5px, 5px) scale(2)';
        moveView(10, 20);
        const resultTransform = sle('#drawing-board').style.transform;
        expect(resultTransform).to.equal('translate(15px, 25px) scale(2)');
    });

});

