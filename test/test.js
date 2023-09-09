const { JSDOM } = require('jsdom');
const { expect } = require('chai');

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.navigator = dom.window.navigator;

function adjustEditRectForTextElement(svgTextElement) {
  const editRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  editRect.setAttribute('id', 'edit-rect');
  editRect.setAttribute('x', svgTextElement.minx);
  editRect.setAttribute('y', svgTextElement.miny);
  document.body.appendChild(editRect);
}

describe('SVG Edit View', function() {
  it('should correctly adjust the edit rect for an SVG text element', function() {


    const svgTextElement = {
      minx: 10,
      miny: 20
    };

    adjustEditRectForTextElement(svgTextElement);

    const editRect = document.getElementById('edit-rect');
    expect(editRect.getAttribute('x')).to.equal('10');
    expect(editRect.getAttribute('y')).to.equal('20');
  });
});
