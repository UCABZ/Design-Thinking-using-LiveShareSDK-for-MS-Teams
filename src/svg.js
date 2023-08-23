


var NS_SVG = 'http://www.w3.org/2000/svg'
var NS_XLINK = 'http://www.w3.org/1999/xlink'

var BrowserType = getBrowserType()

var isSafari = BrowserType === 'Safari'

var isFirefox = BrowserType === 'Firefox'

const intervalTime = 1000
let time = intervalTime
let intervalTimer = null
let timeoutTimer = null

const judgeTransform = () => {
  if (!intervalTimer) {
    intervalTimer = setInterval(() => {
      time--;
      if (time === 0) {
        clearInterval(intervalTimer)
        intervalTimer = null
        time = intervalTime
      }
    }, 1)
  }
  if (timeoutTimer) {
    clearTimeout(timeoutTimer)
  }
  timeoutTimer = setTimeout(() => {
    timeoutTimer = null;
    svg_db.strokeListener()
  }, time)
}

const prox = (Obj = []) => new Proxy(Obj, {
  set(target, property, value) {




    target[property] = value
    return true
  }
})

function proxyObj(Obj = []) {

  if (typeof Obj === 'object') {
    const status = Array.isArray(Obj);
    if (status) {
      Obj.forEach((v, i) => {
        if (typeof v === 'object') {
          Obj[i] = proxyObj(v)
        }
      })
    } else {
      Object.keys(Obj).forEach(v => {
        if (typeof Obj[v] === 'object') {
          Obj[v] = proxyObj(Obj[v])
        }
      });
    }
    const Vue = prox(Obj);
    return Vue
  }
  return new TypeError("Argument must be object or array");
}








var svg_db = {
  strokeListener: null,



  option: {},

  selectStroke: null,

  mousedown: null,

  mouseup: null,

  mousemove: null,

  dbEl: null,

  svgWrapperEl: null,

  svgEl: null,

  strokeEl: null,

  strokeEls: [],

  stroke: null,

  strokes: proxyObj(),

  revokeStrokes: [],

  recoveryStrokes: [],

  inputEl: null,

  inputStroke: null,

  hoverStrokeEl: null,

  hoverEditEl: null,

  hoverInputEl: null,

  isMouseRegister: false,

  isNewStroke: false,

  toFixedNumber: 1,

  mouseDownEvent: null,

  mouseUpEvent: null,

  mouseMoveEvent: null,

  mouseLastOffset: null,

  onResizeEvent: null,

  editMouseCursor: null,

  editStroke: null,

  editStrokeIndex: null,

  editStatus: false,

  editEls: {





    circle1: null,
    circle2: null,
    circle3: null,
    circle4: null,
    circle5: null,
    circle6: null,
    circle7: null,
    circle8: null,
    rect: null
  },




  initOption() {

    var option = this.copy(this.option)

    this.option = {


      strokeType: option.strokeType,

      strokeColor: option.strokeColor || '#000000',

      strokeWidth: option.strokeWidth || 1,

      fontSize: option.fontSize || 14,

      italic: option.italic || false,

      fontFamily: option.fontFamily || 'monospace',

      fontWeight: option.fontWeight || 400,

      fontLineSpace: option.lineSpace || 5,


      maxHeight: option.maxHeight || 0,

      isEdit: option.isEdit || true,

      isEditStroke: option.isEditStroke || true,

      isFill: option.isFill || true,

      isShowEditRect: option.isShowEditRect || true,

      isResize: option.isResize || true,

      isAllowLeaveEditArea: option.isAllowLeaveEditArea || true,

      isPasteTypesetting: option.isPasteTypesetting || true,

      isInputBlurRemove: option.isInputBlurRemove || false,

      inputPlaceholder: (typeof option.inputPlaceholder === 'string') ? option.inputPlaceholder : 'Please enter text',

      inputOffsetW: option.inputOffsetW || 4,

      inputBoderWidth: option.inputBoderWidth || 1,

      inputPadding: option.inputPadding || 5,

      inputBorderRadius: option.inputBorderRadius || 0,

      inputBorderStyle: option.inputBorderStyle || 'solid',

      editBoderWidth: option.inputBoderWidth || 1,

      editRadius: option.editRadius || 4,

      editFillColor: option.editFillColor || '#fff',

      effectiveOffset: option.effectiveOffset || { x: 2, y: 2 },

      editNewCursor: 'crosshair',

      editMoveCursor: 'grab'
    }
  },

  register(el, w, h) {

    if (!el) { return }

    if (this.dbEl) { return }

    this.dbEl = el

    this.initOption()

    this.svgWrapperEl = document.createElement('div')
    this.svgEl = document.createElementNS(NS_SVG, 'svg')

    this.svgEl.setAttribute('width', '100%')
    this.svgEl.setAttribute('height', '100%')
    this.svgEl.style.userSelect = 'none'
    this.svgEl.style.webkitUserSelect = 'none'
    this.svgEl.style.cursor = this.option.editNewCursor

    this.svgWrapperEl.className = 'svg-wrapper'
    this.svgWrapperEl.style.position = 'relative'

    var wString = `${w}`

    if (!!Number(wString)) {
      this.svgWrapperEl.style.width = `${wString}px`
    } else if (wString.includes('px') || wString.includes('%')) {
      this.svgWrapperEl.style.width = wString
    } else {
      this.svgWrapperEl.style.width = '100%'
    }

    var hString = `${h}`

    if (!!Number(hString)) {
      this.svgWrapperEl.style.height = `${hString}px`
    } else if (hString.includes('px') || hString.includes('%')) {
      this.svgWrapperEl.style.height = hString
    } else {
      this.svgWrapperEl.style.height = '100%'
    }

    this.svgWrapperEl.appendChild(this.svgEl)
    this.dbEl.appendChild(this.svgWrapperEl)

    this.mouseRegister()

    this.onScale()

    this.onResizeEvent = () => {

      if (this.option.isResize) { this.onScale() }
    }
    window.addEventListener('resize', this.onResizeEvent)

    this.svgWrapperEl.onmouseout = (e) => {

      if (!this.option.isAllowLeaveEditArea) {

        if (!this.svgWrapperEl.contains(e.toElement)) {

          this.handleMouseUpEvent()
        }
      }
    }
  },

  destroy() {

    if (this.dbEl) {

      window.removeEventListener('resize', this.onResizeEvent)
      this.onResizeEvent = null

      this.clearComponents()

      this.clear()

      this.mouseDownDestroy()

      this.dbEl.removeChild(this.svgWrapperEl)

      this.option = {}

      this.dbEl = null
      this.svgEl = null
      this.svgWrapperEl = null
    }
  },




  clear() {

    if (!this.option.isEdit) { return }

    if (this.svgEl) {

      this.inputRemove()

      this.drawEditClear()

      this.svgEl.innerHTML = ''

      this.strokeEls = []
      this.strokes = proxyObj()

      this.mouseUpEventClear(true)
    }
  },

  setStrokeType(type) {

    this.option.strokeType = type

    if (this.svgEl) {

      this.clearComponents()
    }
  },

  setStrokes(strokes) {

    if (this.svgEl) {

      this.clear()

        ; (strokes || []).forEach(stroke => {

          this.drawCreate(stroke)
        })

      this.mouseUpEventClear()
    }
  },

  reloadStroke(stroke, strokeEl) {

    if (this.editStroke) { this.editStatus = true }

    var strokeEl = strokeEl

    if (!strokeEl) {

      strokeEl = this.strokeEls.find(item => {
        var id = item.getAttribute('id')
        return id === stroke.id
      })
    }

    if (stroke.type === 'text') {

      if (this.inputEl && this.inputStroke.id === stroke.id) {

        this.inputStyleChange(stroke)

        this.inputSizeChange(stroke)
      } else {

        this.inputSizeChange(stroke)

        this.drawChange(stroke, strokeEl)

        this.drawEditChange(stroke)
      }
    } else {

      this.drawChange(stroke, strokeEl)

      this.drawEditChange(stroke)
    }
  },

  revoke() {

    if (!this.option.isEdit) { return }

    this.clearComponents()

    if (this.revokeStrokes.length) {

      var revokeCount = this.revokeStrokes.length
      var count = this.strokes.length
      var lastIndex = revokeCount - 1

      var revokeStroke = this.revokeStrokes[lastIndex]

      var stroke = null
      var strokeIndex = null
      this.strokes.some((item, index) => {
        if (item.id === revokeStroke.id) {
          stroke = this.copy(item)
          strokeIndex = index
          return true
        }
        return false
      })

      if (revokeCount === count) {

        this.revokeStrokes.splice(lastIndex, 1)

        this.strokes.splice(strokeIndex, 1)

        this.svgEl.removeChild(this.strokeEls[strokeIndex])

        this.strokeEls.splice(strokeIndex, 1)

        this.recoveryStrokes.push(stroke)
      } else {

        var strokeEl = this.strokeEls.find(item => item.getAttribute('id') === revokeStroke.id)

        this.revokeStrokes.splice(lastIndex, 1)

        this.strokes[strokeIndex] = revokeStroke

        this.drawChange(revokeStroke, strokeEl)

        this.recoveryStrokes.push(stroke)
      }
    }
  },

  recovery() {

    if (!this.option.isEdit) { return }

    this.clearComponents()

    if (this.recoveryStrokes.length) {

      var lastIndex = this.recoveryStrokes.length - 1

      var recoveryStroke = this.recoveryStrokes[lastIndex]

      var stroke = null
      var strokeIndex = null
      this.strokes.some((item, index) => {
        if (item.id === recoveryStroke.id) {
          stroke = this.copy(item)
          strokeIndex = index
          return true
        }
        return false
      })

      if (stroke) {

        var strokeEl = this.strokeEls.find(item => item.getAttribute('id') === recoveryStroke.id)

        this.recoveryStrokes.splice(lastIndex, 1)

        this.strokes[strokeIndex] = recoveryStroke

        this.drawChange(recoveryStroke, strokeEl)

        this.revokeStrokes.push(stroke)
      } else {

        this.recoveryStrokes.splice(lastIndex, 1)

        this.drawCreate(recoveryStroke)

        this.revokeStrokes.push(recoveryStroke)

        this.mouseUpEventClear()
      }
    }
  },

  clearComponents() {

    if (this.selectStroke && this.editStroke) { this.selectStroke() }

    this.inputBlur()

    this.drawEditClear()
  },




  mouseDownDestroy() {

    this.isMouseRegister = false

    this.svgWrapperEl.removeEventListener('mousedown', this.mouseDownEvent)

    this.mouseDownEvent = null
  },

  mouseUpEventClear(isReset, isCallback = true) {

    this.strokeEl = null
    this.stroke = null

    if (isReset) {
      this.revokeStrokes = this.copy(this.strokes)
      this.recoveryStrokes = []
    }

    if (this.selectStroke && isCallback) { this.selectStroke() }
  },

  mouseRegister() {

    if (this.svgEl) {

      if (!this.isMouseRegister) {

        this.isMouseRegister = true

        this.mouseDownEvent = (e) => {

          this.handleMouseDownEvent(e)
        }

        this.svgWrapperEl.addEventListener('mousedown', this.mouseDownEvent)
      }
    }
  },

  handleMouseDownEvent(e) {

    this.mouseLastOffset = e

    var e = this.handleEventOffset(e)

    if (!this.option.isEdit) { return }

    this.inputReactCheck(e)

    if (this.hoverEditEl) {

      this.inputClear()

      this.mouseDownEventEdit(e)
    } else if (this.hoverInputEl) {

      if (this.option.isEditStroke) { this.mouseDownEventInput(e) }
    } else if (this.hoverStrokeEl) {

      this.inputClear()

      if (this.option.isEditStroke) { this.mouseDownEventMove(e) }
    } else {

      if (this.inputEl) {

        this.inputClear()

        return
      }

      if (this.option.strokeType === 'text' && this.editStroke) {

        this.mouseUpEventClear()

        this.drawEditClear()
      } else {

        this.mouseUpEventClear()

        this.drawEditClear()

        this.mouseDownEventNew(e)
      }
    }
  },

  mouseDownEventNew(e) {

    if (this.mousedown) { this.mousedown(e) }

    if (isSafari) { this.svgEl.style.pointerEvents = 'none' }

    this.isNewStroke = true

    var start = e

    if (this.option.strokeType === 'text') {

      this.inputCreate(e)

      this.svgEl.style.cursor = this.option.editNewCursor

      if (isSafari) { this.svgEl.style.pointerEvents = 'auto' }

      if (this.selectStroke) { this.selectStroke(this.inputStroke) }

      this.isNewStroke = false
    } else {

      this.removeMouseEvent()

      this.mouseUpEvent = (oe) => {

        this.handleMouseUpEvent(oe)
      }

      this.mouseMoveEvent = (oe) => {

        var e = this.handleEventOffset(oe)

        var x = Math.abs(start.offsetX - e.offsetX)
        var y = Math.abs(start.offsetY - e.offsetY)

        if (x > this.option.effectiveOffset.x || y > this.option.effectiveOffset.y) {

          if (this.mousemove) { this.mousemove(e) }

          if (!this.strokeEl) {

            var stroke = this.drawStrokeCreate(start)

            this.drawCreate(stroke)
          }

          this.drawStrokeChange(e)
        }
      }

      this.addMouseEvent()
    }
  },

  mouseDownEventMove(e) {

    if (this.mousedown) { this.mousedown(e) }

    this.svgEl.style.cursor = this.editMouseCursor || this.option.editNewCursor

    this.strokeEl = this.hoverStrokeEl

    var strokeID = this.strokeEl.getAttribute('id')

    if (isSafari && !strokeID.includes('text')) { this.svgEl.style.pointerEvents = 'none' }

    if (!this.editStroke || this.editStroke.id !== strokeID) {

      this.drawEditClear()

      this.strokes.some((stroke, index) => {
        if (stroke.id === strokeID) {
          this.editStroke = this.copy(stroke)
          this.editStrokeIndex = index
          return true
        }
        return false
      })

      this.drawEditCreate()

      if (this.selectStroke) { this.selectStroke(this.editStroke, this.strokeEl) }
    }

    var stroke = this.editStroke

    var start = e

    var svgSize = this.svgSize()

    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    var maxx = this.toFixed(stroke.maxx * svgSize.width)
    var maxy = this.toFixed(stroke.maxy * svgSize.height)

    this.removeMouseEvent()

    this.mouseUpEvent = (oe) => {

      var e = this.handleEventOffset(oe)

      this.handleMouseUpEvent(e)
    }

    this.mouseMoveEvent = (oe) => {

      var e = this.handleEventOffset(oe)

      var x = Math.abs(start.offsetX - e.offsetX)
      var y = Math.abs(start.offsetY - e.offsetY)

      if (x > this.option.effectiveOffset.x || y > this.option.effectiveOffset.y) {

        if (this.mousemove) { this.mousemove(e) }

        this.editStatus = true

        var offsetX = e.movementX
        var offsetY = e.movementY

        minx += offsetX
        miny += offsetY
        maxx += offsetX
        maxy += offsetY
        stroke.minx = minx / svgSize.width
        stroke.miny = miny / svgSize.height
        stroke.maxx = maxx / svgSize.width
        stroke.maxy = maxy / svgSize.height

        if (stroke.type === 'brush') {

          stroke.locations.forEach(location => {
            var x = this.toFixed(location.x * svgSize.width)
            var y = this.toFixed(location.y * svgSize.height)
            x += offsetX
            y += offsetY
            x /= svgSize.width
            y /= svgSize.height
            location.x = x
            location.y = y
          })
        }

        this.drawChange(stroke, this.strokeEl)
        this.drawEditChange(stroke)
      }
    }

    this.addMouseEvent()
  },

  mouseDownEventEdit(e) {

    if (this.mousedown) { this.mousedown(e) }

    if (isSafari) { this.svgEl.style.pointerEvents = 'none' }

    this.svgEl.style.cursor = this.editMouseCursor || this.option.editNewCursor

    var stroke = this.editStroke
    var el = this.hoverEditEl
    var id = el.getAttribute('id')

    var tag = Number(id.split('-')[2])

    var start = e

    var svgSize = this.svgSize()

    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    var maxx = this.toFixed(stroke.maxx * svgSize.width)
    var maxy = this.toFixed(stroke.maxy * svgSize.height)

    this.removeMouseEvent()

    this.mouseUpEvent = (oe) => {

      var e = this.handleEventOffset(oe)

      this.handleMouseUpEvent(e)
    }

    this.mouseMoveEvent = (oe) => {

      if (!this.option.isEditStroke) { return }

      var e = this.handleEventOffset(oe)

      var x = Math.abs(start.offsetX - e.offsetX)
      var y = Math.abs(start.offsetY - e.offsetY)

      if (x > this.option.effectiveOffset.x || y > this.option.effectiveOffset.y) {

        if (this.mousemove) { this.mousemove(e) }

        this.editStatus = true

        var offsetX = e.movementX
        var offsetY = e.movementY

        if (id.includes('circle') && stroke.type !== 'brush') {

          if (tag === 1) {

            minx += offsetX
            miny += offsetY
          } else if (tag === 2) {

            miny += offsetY
            maxx += offsetX
          } else if (tag === 3) {

            minx += offsetX
            maxy += offsetY
          } else if (tag === 4) {

            maxx += offsetX
            maxy += offsetY
          } else if (tag === 5) {

            minx += offsetX
          } else if (tag === 6) {

            miny += offsetY
          } else if (tag === 7) {

            maxx += offsetX
          } else if (tag === 8) {

            maxy += offsetY
          }
        } else {

          minx += offsetX
          miny += offsetY
          maxx += offsetX
          maxy += offsetY
        }

        stroke.minx = minx / svgSize.width
        stroke.miny = miny / svgSize.height
        stroke.maxx = maxx / svgSize.width
        stroke.maxy = maxy / svgSize.height

        if (stroke.type === 'brush') {

          stroke.locations.forEach(location => {
            var x = this.toFixed(location.x * svgSize.width)
            var y = this.toFixed(location.y * svgSize.height)
            x += offsetX
            y += offsetY
            x /= svgSize.width
            y /= svgSize.height
            location.x = x
            location.y = y
          })
        }

        this.drawChange(stroke, this.strokeEl)
        this.drawEditChange(stroke)
      }
    }

    this.addMouseEvent()
  },

  mouseDownEventInput(e) {

    if (this.mousedown) { this.mousedown(e) }

    if (isSafari) { this.svgEl.style.pointerEvents = 'none' }

    this.svgEl.style.cursor = this.editMouseCursor || this.option.editNewCursor

    var stroke = this.inputStroke

    var start = e

    var svgSize = this.svgSize()

    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)

    this.removeMouseEvent()

    this.mouseUpEvent = (oe) => {

      var e = this.handleEventOffset(oe)

      this.handleMouseUpEvent(e)
    }

    this.mouseMoveEvent = (oe) => {

      var e = this.handleEventOffset(oe)

      var x = Math.abs(start.offsetX - e.offsetX)
      var y = Math.abs(start.offsetY - e.offsetY)

      if (x > this.option.effectiveOffset.x || y > this.option.effectiveOffset.y) {

        if (this.mousemove) { this.mousemove(e) }

        this.editStatus = true

        var offsetX = e.movementX
        var offsetY = e.movementY

        minx += offsetX
        miny += offsetY
        stroke.minx = minx / svgSize.width
        stroke.miny = miny / svgSize.height

        this.inputSizeChange(stroke, svgSize)
        this.inputScaleChange()
      }
    }

    this.addMouseEvent()
  },

  handleMouseUpEvent(e) {

    if (this.mouseup && this.stroke) { this.mouseup(e) }

    if (this.isNewStroke) {

      this.isNewStroke = false

      if (this.stroke) { this.mouseUpEventClear(true, false) }
    }

    if (isSafari) { this.svgEl.style.pointerEvents = 'auto' }

    this.svgEl.style.cursor = this.option.editNewCursor

    this.removeMouseEvent()
  },

  addMouseEvent() {

    if (this.mouseUpEvent) {

      this.svgWrapperEl.addEventListener('mouseup', this.mouseUpEvent)
    }

    if (this.mouseMoveEvent) {

      this.svgWrapperEl.addEventListener('mousemove', this.mouseMoveEvent)
    }
  },

  removeMouseEvent() {

    if (this.mouseUpEvent) {

      this.svgWrapperEl.removeEventListener('mouseup', this.mouseUpEvent)

      this.mouseUpEvent = null
    }

    if (this.mouseMoveEvent) {

      this.svgWrapperEl.removeEventListener('mousemove', this.mouseMoveEvent)

      this.mouseMoveEvent = null
    }
  },

  mouseDownEventEditSuccess() {

    if (this.editStroke) {

      if (this.editStatus) {

        var oldStroke = this.strokes[this.editStrokeIndex]
        this.strokes[this.editStrokeIndex] = this.editStroke
        this.revokeStrokes.push(oldStroke)
        this.editStatus = false
      }

      this.editStrokeIndex = null
      this.editStroke = null
    }
  },




  drawStrokeCreate(e) {

    var stroke = null

    var svgSize = this.svgSize()

    var transparentColor = 'rgba(255, 255, 255, 0)'

    var x
    var y
    if (e) {
      x = e.offsetX / svgSize.width
      y = e.offsetY / svgSize.height
    }
    const t = e.type || this.option.strokeType
    console.log(t)

    if (['rect', 'line', 'circle', 'ellipse'].includes(t)) {

      stroke = {
        id: `${t}-${this.uuid()}`,
        type: t,
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth,
        fill: transparentColor,
        minx: x,
        miny: y,
        maxx: x,
        maxy: y
      }
    } else if (t === 'text') {

      stroke = {
        id: `${t}-${this.uuid()}`,
        type: t,
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth,
        fill: transparentColor,
        minx: x,
        miny: y,
        maxx: x,
        maxy: y,
        text: this.option.inputPlaceholder,
        fontLineSpace: this.option.fontLineSpace,
        fontSize: this.option.fontSize,
        italic: this.option.italic,
        fontWeight: this.option.fontWeight,
        fontFamily: this.option.fontFamily
      }
    } else if (t === 'brush') {

      stroke = {
        id: `${t}-${this.uuid()}`,
        type: t,
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth,
        fill: transparentColor,
        minx: x,
        miny: y,
        maxx: x,
        maxy: y,
        locations: []
      }
    } else if (t === 'arrow') {

      stroke = {
        id: `${t}-${this.uuid()}`,
        type: t,
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth,
        fill: transparentColor,
        minx: x,
        miny: y,
        maxx: x,
        maxy: y
      }
    } else if (t === 'sticker') {

      stroke = {
        id: `${t}-${this.uuid()}`,
        type: t,
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth,
        fill: transparentColor,
        minx: x,
        miny: y,
        maxx: x,
        maxy: y
      }
    } else if (t === 'picture') {

      stroke = {
        id: `${t}-${this.uuid()}`,
        type: t,
        minx: 0.3,
        miny: 0.3,
        maxx: 0.6,
        maxy: 0.6,
        href: e.href
      }

    }

    return proxyObj(stroke)
  },

  drawStrokeChange(e) {

    if (!this.strokeEl || !this.stroke) { return }

    var svgSize = this.svgSize()

    if (['rect', 'line', 'circle', 'ellipse', 'arrow', 'sticker', 'picture'].includes(this.option.strokeType)) {

      this.stroke.maxx = e.offsetX / svgSize.width
      this.stroke.maxy = e.offsetY / svgSize.height
      this.drawChange(this.stroke, this.strokeEl)
    } else if (this.option.strokeType === 'brush') {

      var x = e.offsetX / svgSize.width
      var y = e.offsetY / svgSize.height
      this.stroke.maxx = x
      this.stroke.maxy = y
      this.stroke.locations.push({ x: x, y: y })
      this.drawChange(this.stroke, this.strokeEl)
    }
  },

  drawCreate(stroke) {

    var strokeEl = null

    if (stroke.type === 'rect') {

      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'line') {

      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'circle') {

      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'ellipse') {

      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'text') {

      strokeEl = document.createElementNS(NS_SVG, stroke.type)
    } else if (stroke.type === 'brush') {

      strokeEl = document.createElementNS(NS_SVG, 'path')
    } else if (stroke.type === 'arrow') {

      strokeEl = document.createElementNS(NS_SVG, 'path')
    } else if (stroke.type === 'sticker') {

      strokeEl = document.createElementNS(NS_SVG, 'g')
    } else if (stroke.type === 'picture') {

      strokeEl = document.createElementNS(NS_SVG, 'image')
    }


    if (strokeEl) {

      this.drawChange(stroke, strokeEl)

      this.strokeEl = strokeEl
      this.strokeEls.push(strokeEl)
      this.stroke = stroke
      this.strokes.push(stroke)

      if (stroke.type === 'sticker') {
        this.svgEl.insertBefore(strokeEl, this.svgEl.children[0])
      } else {
        this.svgEl.append(strokeEl)
      }

      if (stroke.type === 'text') {

        strokeEl.ondblclick = () => {

          this.drawEditClear()

          if (!this.option.isEditStroke) { return }

          var strokeID = strokeEl.getAttribute('id')

          this.strokes.some(stroke => {
            if (stroke.id === strokeID) {
              this.inputStroke = stroke
              this.stroke = stroke
              return true
            }
            return false
          })
          this.strokeEl = strokeEl

          strokeEl.style.display = 'none'

          this.inputCreate()
        }
      }

      strokeEl.onmouseover = () => {

        if (!this.isNewStroke) {

          strokeEl.style.cursor = this.option.editMoveCursor

          this.editMouseCursor = this.option.editMoveCursor

          this.hoverStrokeEl = strokeEl
        }
      }

      strokeEl.onmouseout = () => {

        strokeEl.style.cursor = this.option.editNewCursor

        this.editMouseCursor = null

        this.hoverStrokeEl = null
      }
    }
  },

  drawChange(stroke, strokeEl) {

    if (!stroke || !strokeEl) { return }

    this.strokes.forEach(e => {
      if (e.id === stroke.id) {
        Object.assign(e, stroke)
      }
    })

    var svgSize = this.svgSize()

    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    var maxx = this.toFixed(stroke.maxx * svgSize.width)
    var maxy = this.toFixed(stroke.maxy * svgSize.height)


    strokeEl.setAttribute('id', stroke.id)
    strokeEl.setAttribute('stroke', stroke.stroke)
    strokeEl.setAttribute('stroke-width', stroke.strokeWidth)
    strokeEl.setAttribute('fill', stroke.fill)


    if (stroke.type === 'rect') {

      var x = Math.min(minx, maxx)
      var y = Math.min(miny, maxy)
      var width = Math.abs(minx - maxx)
      var height = Math.abs(miny - maxy)
      strokeEl.setAttribute('x', x)
      strokeEl.setAttribute('y', y)
      strokeEl.setAttribute('width', width)
      strokeEl.setAttribute('height', height)
    } else if (stroke.type === 'line') {

      strokeEl.setAttribute('x1', minx)
      strokeEl.setAttribute('y1', miny)
      strokeEl.setAttribute('x2', maxx)
      strokeEl.setAttribute('y2', maxy)
    } else if (stroke.type === 'circle') {

      var x = Math.min(minx, maxx)
      var y = Math.min(miny, maxy)
      var width = Math.abs(minx - maxx)
      var height = Math.abs(miny - maxy)
      var cx = x + width / 2
      var cy = y + height / 2
      var r = Math.max(width, height) / 2
      strokeEl.setAttribute('cx', cx)
      strokeEl.setAttribute('cy', cy)
      strokeEl.setAttribute('r', r)
    } else if (stroke.type === 'ellipse') {

      var x = Math.min(minx, maxx)
      var y = Math.min(miny, maxy)
      var width = Math.abs(minx - maxx)
      var height = Math.abs(miny - maxy)
      var cx = x + width / 2
      var cy = y + height / 2
      var rx = width / 2
      var ry = height / 2
      strokeEl.setAttribute('cx', cx)
      strokeEl.setAttribute('cy', cy)
      strokeEl.setAttribute('rx', rx)
      strokeEl.setAttribute('ry', ry)
    } else if (stroke.type === 'text') {

      var scale = this.scaleValue(svgSize)
      var fontSize = this.toFixed(stroke.fontSize * scale)
      var fontWeight = stroke.fontWeight
      var fontLineSpace = this.toFixed(stroke.fontLineSpace * scale)
      var space = this.toFixed(this.option.inputPadding * scale)
      miny -= space

      strokeEl.setAttribute('x', minx)
      strokeEl.setAttribute('y', miny)
      strokeEl.setAttribute('font-size', fontSize)
      strokeEl.setAttribute('font-weight', fontWeight)
      strokeEl.setAttribute('font-style', stroke.italic ? 'italic' : 'unset')
      strokeEl.setAttribute('font-family', stroke.fontFamily)
      strokeEl.setAttribute('stroke', stroke.fill)
      strokeEl.setAttribute('stroke-width', 0)
      strokeEl.setAttribute('fill', stroke.stroke)

      var innerHTML = ''
      var texts = stroke.text.split('\n')
      texts.forEach(item => {

        innerHTML += `<tspan x="${minx}" dy="${fontSize + fontLineSpace}">${item || '　'}</tspan>`
      })
      strokeEl.innerHTML = innerHTML
    } else if (stroke.type === 'brush') {

      var d = `M ${minx} ${miny}`
      stroke.locations.forEach(location => {
        var x = this.toFixed(location.x * svgSize.width)
        var y = this.toFixed(location.y * svgSize.height)
        d += ` Q ${x} ${y} ${x} ${y}`
      })
      strokeEl.setAttribute('d', d)
    } else if (stroke.type === 'arrow') {

      strokeEl.setAttribute('fill', this.option.isFill ? stroke.stroke : stroke.fill)

      strokeEl.setAttribute('stroke-width', 1)

      var width = Math.abs(minx - maxx)
      var height = Math.abs(miny - maxy)
      var diagonal = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))

      var el = Math.min(diagonal * 0.3, 50)
      var al = Math.min(diagonal * 1.0, 25)

      var vertexs = []
      var x1 = minx
      var y1 = miny
      var x2 = maxx
      var y2 = maxy

      vertexs[0] = x1
      vertexs[1] = y1
      vertexs[6] = x2
      vertexs[7] = y2

      var angle = Math.atan2(y2 - y1, x2 - x1) / Math.PI * 180
      var x = x2 - x1
      var y = y2 - y1
      var length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
      if (length < 250) {
        el /= 2
        al /= 2
      } else if (length < 500) {
        el *= length / 500
        al *= length / 500
      }
      vertexs[8] = x2 - el * Math.cos(Math.PI / 180 * (angle + al))
      vertexs[9] = y2 - el * Math.sin(Math.PI / 180 * (angle + al))
      vertexs[4] = x2 - el * Math.cos(Math.PI / 180 * (angle - al))
      vertexs[5] = y2 - el * Math.sin(Math.PI / 180 * (angle - al))

      x = (vertexs[4] + vertexs[8]) / 2
      y = (vertexs[5] + vertexs[9]) / 2
      vertexs[2] = (vertexs[4] + x) / 2
      vertexs[3] = (vertexs[5] + y) / 2
      vertexs[10] = (vertexs[8] + x) / 2
      vertexs[11] = (vertexs[9] + y) / 2

      vertexs = vertexs.map((vertex) => {
        return this.toFixed(vertex)
      })

      strokeEl.setAttribute('d', `M ${vertexs[0]} ${vertexs[1]} L ${vertexs[2]} ${vertexs[3]} L ${vertexs[4]} ${vertexs[5]} L ${vertexs[6]} ${vertexs[7]} L ${vertexs[8]} ${vertexs[9]} L ${vertexs[10]} ${vertexs[11]} Z`)
    } else if (stroke.type === 'sticker') {
      var x1 = minx
      var y1 = miny
      var x2 = maxx
      var y2 = maxy
      const path1 = document.createElementNS(NS_SVG, 'path')
      const path2 = document.createElementNS(NS_SVG, 'path')
      path1.setAttribute('stroke-width', 0)
      path2.setAttribute('stroke-width', 0)
      path1.setAttribute('fill', 'rgb(245,236,167)')
      path2.setAttribute('fill', 'rgb(247,242,202)')

      const h = 40
      path1.setAttribute('d', `M ${x1} ${y1} L ${x1} ${y1 + h} L ${x2} ${y1 + h} L ${x2} ${y1} Z`)
      path2.setAttribute('d', `M ${x1} ${y1 + h} L ${x1} ${y2} L ${x2} ${y2} L ${x2} ${y1 + h} Z`)
      strokeEl.innerHTML = ''
      strokeEl.appendChild(path1)
      strokeEl.appendChild(path2)
    } else if (stroke.type === 'picture') {
      var x1 = minx
      var y1 = miny
      var x2 = maxx
      var y2 = maxy

      strokeEl.setAttribute('x', minx)
      strokeEl.setAttribute('y', miny)
      strokeEl.setAttribute('height', maxy - miny)
      strokeEl.setAttribute('width', maxx - minx)
      strokeEl.setAttribute('href', stroke.href)
    }
  },

  drawEditCreate() {

    if (!this.editStroke) { return }

    var that = this

    if (['rect', 'circle', 'ellipse', 'sticker', 'picture'].includes(this.editStroke.type)) {

      this.editEls.circle1 = document.createElementNS(NS_SVG, 'circle')
      this.editEls.circle2 = document.createElementNS(NS_SVG, 'circle')
      this.editEls.circle3 = document.createElementNS(NS_SVG, 'circle')
      this.editEls.circle4 = document.createElementNS(NS_SVG, 'circle')

      if (this.editStroke.type !== 'circle') {
        this.editEls.circle5 = document.createElementNS(NS_SVG, 'circle')
        this.editEls.circle6 = document.createElementNS(NS_SVG, 'circle')
        this.editEls.circle7 = document.createElementNS(NS_SVG, 'circle')
        this.editEls.circle8 = document.createElementNS(NS_SVG, 'circle')
      }
    } else if (['line', 'brush', 'arrow'].includes(this.editStroke.type)) {

      this.editEls.circle1 = document.createElementNS(NS_SVG, 'circle')
      this.editEls.circle4 = document.createElementNS(NS_SVG, 'circle')
    }

    if (this.option.isShowEditRect) {

      if (['text'].includes(this.editStroke.type)) {

        this.editEls.rect = document.createElementNS(NS_SVG, 'rect')

        this.svgEl.append(this.editEls.rect)
      }
    }

    var els = [this.editEls.circle1, this.editEls.circle2, this.editEls.circle3, this.editEls.circle4, this.editEls.circle5, this.editEls.circle6, this.editEls.circle7, this.editEls.circle8, this.editEls.rect]

    els.forEach(el => {

      if (!el) { return }

      this.svgEl.append(el)

      el.onmouseover = () => {

        this.editMouseCursor = el.style.cursor

        that.hoverEditEl = el
      }

      el.onmouseout = () => {

        this.editMouseCursor = null

        this.hoverEditEl = null
      }
    })

    this.drawEditChange(this.editStroke)
  },

  drawEditChange(stroke) {

    if (!stroke) { return }

    var svgSize = this.svgSize()

    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    var maxx = this.toFixed(stroke.maxx * svgSize.width)
    var maxy = this.toFixed(stroke.maxy * svgSize.height)
    var radius = this.option.editRadius

    if (this.editEls.rect) {

      if (stroke.type === 'text') {


        var width = maxx - minx
        var height = maxy - miny
        var scale = this.scaleValue(svgSize)
        var space = this.option.inputPadding * scale
        minx -= space
        miny -= space
        width += 2 * space
        height += 2 * space

        this.editEls.rect.setAttribute('id', `edit-rect`)
        this.editEls.rect.setAttribute('stroke', stroke.stroke)
        this.editEls.rect.setAttribute('stroke-width', this.option.inputBoderWidth)
        this.editEls.rect.setAttribute('fill', 'none')
        this.editEls.rect.setAttribute('x', minx)
        this.editEls.rect.setAttribute('y', miny)
        this.editEls.rect.setAttribute('width', width)
        this.editEls.rect.setAttribute('height', height)
        this.editEls.rect.style.cursor = this.option.editMoveCursor
      }
    }

    var circles = [this.editEls.circle1, this.editEls.circle2, this.editEls.circle3, this.editEls.circle4, this.editEls.circle5, this.editEls.circle6, this.editEls.circle7, this.editEls.circle8]

    circles.forEach((circle, index) => {

      if (!circle) { return }

      circle.setAttribute('id', `edit-circle-${index + 1}`)
      circle.setAttribute('stroke', stroke.stroke)
      circle.setAttribute('stroke-width', this.option.editBoderWidth)
      circle.setAttribute('fill', this.option.editFillColor)
    })


    if (this.editEls.circle1) {
      this.editEls.circle1.setAttribute('cx', minx)
      this.editEls.circle1.setAttribute('cy', miny)
      this.editEls.circle1.setAttribute('r', radius)
      this.editEls.circle1.style.cursor = 'move'
    }

    if (this.editEls.circle2) {
      this.editEls.circle2.setAttribute('cx', maxx)
      this.editEls.circle2.setAttribute('cy', miny)
      this.editEls.circle2.setAttribute('r', radius)
    }

    if (this.editEls.circle3) {
      this.editEls.circle3.setAttribute('cx', minx)
      this.editEls.circle3.setAttribute('cy', maxy)
      this.editEls.circle3.setAttribute('r', radius)
    }

    if (this.editEls.circle4) {
      this.editEls.circle4.setAttribute('cx', maxx)
      this.editEls.circle4.setAttribute('cy', maxy)
      this.editEls.circle4.setAttribute('r', radius)
      this.editEls.circle4.style.cursor = 'move'
    }

    if (this.editEls.circle5) {
      this.editEls.circle5.setAttribute('cx', minx)
      this.editEls.circle5.setAttribute('cy', miny + (maxy - miny) / 2)
      this.editEls.circle5.setAttribute('r', radius)
      this.editEls.circle5.style.cursor = 'ew-resize'
    }

    if (this.editEls.circle6) {
      this.editEls.circle6.setAttribute('cx', minx + (maxx - minx) / 2)
      this.editEls.circle6.setAttribute('cy', miny)
      this.editEls.circle6.setAttribute('r', radius)
      this.editEls.circle6.style.cursor = 'ns-resize'
    }

    if (this.editEls.circle7) {
      this.editEls.circle7.setAttribute('cx', maxx)
      this.editEls.circle7.setAttribute('cy', miny + (maxy - miny) / 2)
      this.editEls.circle7.setAttribute('r', radius)
      this.editEls.circle7.style.cursor = 'ew-resize'
    }

    if (this.editEls.circle8) {
      this.editEls.circle8.setAttribute('cx', minx + (maxx - minx) / 2)
      this.editEls.circle8.setAttribute('cy', maxy)
      this.editEls.circle8.setAttribute('r', radius)
      this.editEls.circle8.style.cursor = 'ns-resize'
    }

    if (['rect', 'circle', 'ellipse'].includes(stroke.type)) {

      if (minx > maxx) {
        if (miny > maxy) {
          this.editEls.circle1.style.cursor = 'nwse-resize'
          this.editEls.circle4.style.cursor = 'nwse-resize'
        } else {
          this.editEls.circle1.style.cursor = 'nesw-resize'
          this.editEls.circle4.style.cursor = 'nesw-resize'
        }
      } else {
        if (miny > maxy) {
          this.editEls.circle1.style.cursor = 'nesw-resize'
          this.editEls.circle4.style.cursor = 'nesw-resize'
        } else {
          this.editEls.circle1.style.cursor = 'nwse-resize'
          this.editEls.circle4.style.cursor = 'nwse-resize'
        }
      }

      if (miny > maxy) {
        if (minx > maxx) {
          this.editEls.circle2.style.cursor = 'nesw-resize'
          this.editEls.circle3.style.cursor = 'nesw-resize'
        } else {
          this.editEls.circle2.style.cursor = 'nwse-resize'
          this.editEls.circle3.style.cursor = 'nwse-resize'
        }
      } else {
        if (minx > maxx) {
          this.editEls.circle2.style.cursor = 'nwse-resize'
          this.editEls.circle3.style.cursor = 'nwse-resize'
        } else {
          this.editEls.circle2.style.cursor = 'nesw-resize'
          this.editEls.circle3.style.cursor = 'nesw-resize'
        }
      }
    }
  },

  drawEditClear() {

    this.mouseDownEventEditSuccess()

    if (this.svgEl) {

      var els = [this.editEls.circle1, this.editEls.circle2, this.editEls.circle3, this.editEls.circle4, this.editEls.circle5, this.editEls.circle6, this.editEls.circle7, this.editEls.circle8, this.editEls.rect]

      els.forEach(el => {

        if (el) { this.svgEl.removeChild(el) }
      })
    }

    this.editEls = {
      circle1: null,
      circle2: null,
      circle3: null,
      circle4: null,
      circle5: null,
      circle6: null,
      circle7: null,
      circle8: null,
      rect: null
    }
  },




  inputCreate(e) {
    if (!this.inputEl) {

      if (!this.inputStroke) { this.inputStroke = this.drawStrokeCreate(e) }

      var stroke = this.inputStroke
      var svgSize = this.svgSize()

      var inputEl = document.createElement('div')
      inputEl.style.position = 'absolute'
      inputEl.style.top = '0px'
      inputEl.style.left = '0px'
      inputEl.style.cursor = this.option.editMoveCursor
      inputEl.style.outline = 'none'
      inputEl.style.wordBreak = 'break-all'
      inputEl.style.whiteSpace = 'normal'
      inputEl.setAttribute('contenteditable', true)

      this.inputEl = inputEl

      this.inputStyleChange(stroke)

      this.svgWrapperEl.appendChild(inputEl)

      this.inputSizeChange(stroke, svgSize)

      this.inputScaleChange()

      inputEl.onmouseover = () => {

        this.editMouseCursor = inputEl.style.cursor

        this.hoverInputEl = inputEl
      }

      inputEl.onmouseout = () => {

        this.editMouseCursor = null

        this.hoverInputEl = null
      }

      inputEl.onpaste = () => {

        e.preventDefault()

        var text = ''

        var clp = (e.originalEvent || e).clipboardData

        if (clp && clp.getData) {
          text = clp.getData('text/plain') || ''
        } else if (window.clipboardData && window.clipboardData.getData) {
          text = window.clipboardData.getData('text') || ''
        }

        if (text !== '') {

          if (this.option.isPasteTypesetting) {

            text = text.replaceAll(/　+/, ' ')

            text = text.replaceAll(/^\s+/, '')

            text = text.replaceAll(/\n\s+/, '\n')

            text = text.replaceAll(/ +/, ' ')
          }

          if (clp === undefined || clp === null) {

            if (window.getSelection) {

              var newNode = document.createElement('span')
              newNode.innerHTML = text
              window.getSelection().getRangeAt(0).insertNode(newNode)
            } else {

              document.selection.createRange().pasteHTML(text)
            }

            this.inputChange(stroke, svgSize)
          } else {

            document.execCommand('insertText', false, text)
          }
        }
      }

      setTimeout(() => {

        inputEl.focus()
        this.selectText(inputEl)

        inputEl.oninput = () => {

          this.inputChange(stroke, svgSize)
        }

        if (this.option.isInputBlurRemove) {

          inputEl.onblur = () => {

            this.inputBlur()
          }
        }
      }, 0)
    }
  },

  inputStyleChange(stroke) {

    this.inputEl.style.padding = `${this.option.inputPadding}px`
    this.inputEl.style.border = `${this.option.inputBoderWidth}px ${this.option.inputBorderStyle} ${stroke.stroke}`
    this.inputEl.style.borderRadius = `${this.option.inputBorderRadius}px`

    this.inputEl.style.color = stroke.stroke
    this.inputEl.style.fontSize = `${stroke.fontSize}px`
    this.inputEl.style.fontWeight = stroke.fontWeight
    this.inputEl.style.fontStyle = stroke.italic ? 'italic' : 'unset'
    this.inputEl.style.fontFamily = stroke.fontFamily
    this.inputEl.style.width = this.inputEl.style.fontSize
    this.inputEl.style.lineHeight = `${stroke.fontSize + this.option.fontLineSpace}px`

    var texts = (stroke.text || '').split('\n')
    var innerHTML = ''
    texts.forEach(text => {

      if (!text.length) {

        innerHTML += '<div><br/></div>'
      } else {

        innerHTML += `<div>${text}</div>`
      }
    })

    this.inputEl.innerHTML = innerHTML
  },

  inputChange(stroke, svgSize) {

    stroke.text = this.inputEl.innerHTML

    if (stroke.text.indexOf('<div>') === 0) {

      stroke.text = stroke.text.replace('<div>', '')
    }

    stroke.text = stroke.text.replaceAll('<br>', '').replaceAll('</div>', '').replaceAll('<span>', '').replaceAll('</span>', '').replaceAll('<div>', '\n')

    this.inputSizeChange(stroke, svgSize)
  },

  inputClear() {

    if (!this.option.isInputBlurRemove) {

      this.inputBlur()
    }
  },

  inputReactCheck(e) {

    if (this.hoverInputEl) {

      var input = this.hoverInputEl
      var minx = input.offsetLeft
      var miny = input.offsetTop
      var maxx = input.offsetLeft + input.offsetWidth
      var maxy = input.offsetTop + input.offsetHeight

      var x = e.offsetX + minx
      var y = e.offsetY + miny

      if (x < minx || x > maxx || y < miny || y > maxy) {

        this.hoverInputEl = null
        this.hoverStrokeEl = null
      }
    }
  },

  inputBlur() {
    if (this.inputEl) {

      if (this.strokeEl) {

        this.drawChange(this.inputStroke, this.strokeEl)
        this.strokeEl.style.display = 'block'
      } else {

        this.drawCreate(this.inputStroke)
      }

      this.inputRemove()

      this.mouseUpEventClear(true)
      this.strokeListener?.()
    }
  },

  inputRemove() {
    if (this.inputEl) {
      this.svgWrapperEl.removeChild(this.inputEl)
      this.inputStroke = null
      this.inputEl = null
    }
  },

  inputSizeChange(stroke, svgSize) {

    if (!stroke) { return }

    var svgSize = svgSize || this.svgSize()

    var lineh = stroke.fontSize + this.option.fontLineSpace

    var text = stroke.text

    var span = document.createElement('div')

    span.style.opacity = 0
    span.style.padding = 0
    span.style.margin = 0
    span.style.display = 'inline-block'
    span.style.fontSize = `${stroke.fontSize}px`
    span.style.fontWeight = stroke.fontWeight
    span.style.fontStyle = stroke.italic ? 'italic' : 'unset'
    span.style.fontFamily = stroke.fontFamily
    span.style.wordBreak = 'break-all'
    span.style.whiteSpace = 'normal'

    var texts = text.split('\n')

    var innerHTML = ''

    texts.forEach(text => {
      innerHTML += `<div>${text}</div>`
    })

    span.innerHTML = innerHTML

    document.body.appendChild(span)

    var width = span.clientWidth + this.option.inputOffsetW
    var height = texts.length * lineh

    document.body.removeChild(span)

    if (this.inputEl) {
      this.inputEl.style.width = `${width}px`
      this.inputEl.style.height = `${height}px`
    }

    var scale = this.scaleValue(svgSize)
    var minx = this.toFixed(stroke.minx * svgSize.width)
    var miny = this.toFixed(stroke.miny * svgSize.height)
    stroke.maxx = (minx + width * scale) / svgSize.width
    stroke.maxy = (miny + height * scale) / svgSize.height
  },

  inputScaleChange() {
    if (this.inputEl && this.inputStroke) {

      var stroke = this.inputStroke
      var svgSize = this.svgSize()
      var scale = this.scaleValue(svgSize)
      var space = (this.option.inputPadding + this.option.inputBoderWidth) * scale

      var minx = this.toFixed(stroke.minx * svgSize.width) - space
      var miny = this.toFixed(stroke.miny * svgSize.height) - space

      this.inputEl.style.transform = `scale(${scale})`
      this.inputEl.style.transformOrigin = '0 0'
      this.inputEl.style.left = `${minx}px`
      this.inputEl.style.top = `${miny}px`
    }
  },




  onScale() {

    if (this.editStroke) {

      this.mouseUpEventClear()

      this.drawEditClear()
    }

    var dbWidth = this.dbEl.clientWidth
    var dbHeight = this.dbEl.clientHeight
    var svgSize = this.svgSize()

    var width = this.svgWrapperEl.style.width
    var height = this.svgWrapperEl.style.height

    var rect = this.objectFitSize(dbWidth, dbHeight, svgSize.width, svgSize.height)

    if (width.includes('px') && height.includes('px')) {
      this.svgWrapperEl.style.width = `${this.toFixed(rect.width)}px`
      this.svgWrapperEl.style.height = `${this.toFixed(rect.height)}px`
    }

    this.strokeEls.forEach((strokeEl, index) => {

      this.drawChange(this.strokes[index], strokeEl)
    })

    this.inputScaleChange()
  },

  svgSize() {

    var width = this.svgWrapperEl.style.width
    var height = this.svgWrapperEl.style.height

    if (width.includes('px')) {
      width = Number(width.replace('px', ''))
    } else {
      width = this.svgWrapperEl.clientWidth
    }
    if (height.includes('px')) {
      height = Number(height.replace('px', ''))
    } else {
      height = this.svgWrapperEl.clientHeight
    }

    return { width, height }
  },

  scaleValue(svgSize) {

    var svgSize = svgSize || this.svgSize()

    return this.option.maxHeight ? this.toFixed(svgSize.height / this.option.maxHeight) : 1
  },

  selectText(el) {
    if (document.selection) {
      var range = document.body.createTextRange()
      range.moveToElementText(el)
      range.select()
    } else if (window.getSelection) {
      var range = document.createRange()
      range.selectNodeContents(el)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
    }
  },

  uuid() {

    function S4() { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) }

    return (S4() + S4() + "" + S4() + "" + S4() + "" + S4() + "" + S4() + S4() + S4())
  },

  toFixed(obj, num) {

    var number = Number(obj || 0)

    if (num === 0) {

      return parseInt(number)
    } else {

      return Number(number.toFixed(num || this.toFixedNumber))
    }
  },

  handleEventOffset(e) {

    var obj = {
      offsetX: e.offsetX,
      offsetY: e.offsetY,
      movementX: e.offsetX - this.mouseLastOffset.offsetX,
      movementY: e.offsetY - this.mouseLastOffset.offsetY
    }

    if (isFirefox) {
      obj.offsetX = e.layerX
      obj.offsetY = e.layerY
      obj.movementX = e.layerX - this.mouseLastOffset.layerX
      obj.movementY = e.layerY - this.mouseLastOffset.layerY
    }

    this.mouseLastOffset = e

    return obj
  },

  objectFitSize(cw, ch, w, h, contain = true) {

    var r = w / h
    var cr = cw / ch

    var tw = 0
    var th = 0

    var result = contain ? (r > cr) : (r < cr)

    if (result) {
      tw = cw
      th = tw / r
    } else {
      th = ch
      tw = th * r
    }

    return {
      width: tw,
      height: th,
      x: (cw - tw) / 2,
      y: (ch - th) / 2
    }
  },

  viWH(filePath, callback) {

    var url = filePath

    var isString = (typeof url === 'string')

    if (!isString) { url = URL.createObjectURL(filePath) }

    if (this.fileIsVideo(filePath)) {

      var video = document.createElement('video')

      video.onloadedmetadata = () => {

        if (!isString) { URL.revokeObjectURL(url) }

        if (callback) { callback(video.videoWidth, video.videoHeight) }
      }

      video.src = url

      video.load()
    } else if (this.fileIsImage(filePath)) {

      var img = new Image()

      img.src = url

      img.onload = () => {

        if (!isString) { URL.revokeObjectURL(url) }

        if (callback) { callback(img.width, img.height) }
      };
    } else {

      if (callback) { callback(0, 0) }
    }
  },

  fileIsImage(filePath, isFuzzy = true) {

    var types = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff']

    return this.fileIsType(filePath, types, isFuzzy)
  },

  fileIsVideo(filePath, isFuzzy = true) {

    var types = ['mp4', 'mp3', 'avi', 'wmv', 'mpg', 'mpeg', 'mov', 'rm', 'ram', 'swf', 'flv', 'wma', 'avi', 'rmvb', 'mkv']

    return this.fileIsType(filePath, types, isFuzzy)
  },

  fileIsType(filePath, types, isFuzzy = true) {

    var isResult = false

    if (filePath && filePath.length && types.length) {

      var type = this.fileExtension(filePath)

      isResult = types.indexOf(type.toLowerCase()) !== -1

      if (!isResult && isFuzzy) {

        types.some(item => {

          var reg = new RegExp(`\\.${item}\\?`, 'i')

          var results = filePath.match(reg) || []

          isResult = Boolean(results.length)

          return isResult
        })
      }
    }

    return isResult
  },

  fileExtension(filePath) {

    var type = ''

    if (filePath && filePath.length) {

      var index = filePath.lastIndexOf('.')

      type = filePath.substr(index + 1)
    }

    return type
  },

  copy(json) {

    if (json) { return JSON.parse(JSON.stringify(json)) }

    return {}
  }
}


String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2)
}


function getBrowserType() {

  var ua = navigator.userAgent


  var isOpera = ua.indexOf('Opera') > -1

  if (isOpera) { return 'Opera' }


  var isIE = (ua.indexOf('compatible') > -1) && (ua.indexOf('MSIE') > -1) && !isOpera
  var isIE11 = (ua.indexOf('Trident') > -1) && (ua.indexOf("rv:11.0") > -1)

  if (isIE11) {
    return 'IE11'
  } else if (isIE) {

    var re = new RegExp('MSIE (\\d+\\.\\d+);')
    re.test(ua)

    var ver = parseFloat(RegExp["$1"])

    if (ver == 7) {
      return 'IE7'
    } else if (ver == 8) {
      return 'IE8'
    } else if (ver == 9) {
      return 'IE9'
    } else if (ver == 10) {
      return 'IE10'
    } else { return "IE" }
  }


  var isEdge = ua.indexOf("Edge") > -1

  if (isEdge) { return 'Edge' }


  var isFirefox = ua.indexOf("Firefox") > -1

  if (isFirefox) { return 'Firefox' }


  var isSafari = (ua.indexOf("Safari") > -1) && (ua.indexOf("Chrome") == -1)

  if (isSafari) { return "Safari" }


  var isChrome = (ua.indexOf("Chrome") > -1) && (ua.indexOf("Safari") > -1) && (ua.indexOf("Edge") == -1)

  if (isChrome) { return 'Chrome' }


  var isUC = ua.indexOf("UBrowser") > -1

  if (isUC) { return 'UC' }


  var isQQ = ua.indexOf("QQBrowser") > -1

  if (isQQ) { return 'QQ' }


  return ''
}

export { NS_SVG, NS_XLINK, BrowserType, isSafari, isFirefox, svg_db }