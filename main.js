const OUTLINE_ID_PREFIX = 'Outline_x5F_'
const editMode = false
let mouseNavEnabled = !editMode

const LAYER_CLASS = 'overlay-layer'

const HIGHLIGHT_LAYER = 'Layer_8'
const TITLES_LAYER = 'Titles'
const PROTOTYPE_LAYER = 'Prototype_Library'
const MOVEMENT_LAYER = 'Layer_5'
const USES_LAYER = 'Layer_2'
const MATERIALITY_LAYER = 'Layer_3'
const APPEARANCE_LAYER = 'Layer_4'

// MODAL
const modal = document.getElementById("on-load-modal");
const modal_close = document.getElementsByClassName("modal-close")[0];
modal_close.onclick = function () {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = e => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

const selectSideTitle = selector => {
  $('.selected-title').removeClass('selected-title')
  $(selector).addClass('selected-title')
  // close and open subsections
  $('.sub-section').addClass('closed')
  $(selector).parent().find('.sub-section').removeClass('closed')
}

const selectSubSection = selector => {
  $('.sub-section-title .selected').removeClass('selected')
  $(selector).addClass('selected')
}

const slt = new SimpleLightbox('#giardini-today-gallery a', {
  captionSelector: 'self',
  captionPosition: 'outside',
  maxZoom: 20,
});

document.getElementById('about-button').addEventListener('click', () => {
  modal.style.display = 'inherit'
  $('.modal-intro-content').html($('#about-content').html())
})

document.getElementById('giardini-intervene-button').addEventListener('click', () => {
  selectSideTitle('#giardini-intervene-button')
  showLayers([HIGHLIGHT_LAYER])
  unfreezeAllHighlights()
})

document.getElementById('giardini-today-button').addEventListener('click', () => {
  selectSideTitle('#giardini-today-button')
  unfreezeAllHighlights()
  slt.open();
})

document.getElementById('porous-giardini-button').addEventListener('click', () => {
  selectSideTitle('#porous-giardini-button')
  showLayers([HIGHLIGHT_LAYER, TITLES_LAYER])
  freezeAllHighlights()
  raiseLayer(TITLES_LAYER)
})

document.getElementById('prototype-library-button').addEventListener('click', () => {
  selectSideTitle('#porous-giardini-button')
  selectSubSection('#prototype-library-button')
  showLayers([HIGHLIGHT_LAYER, PROTOTYPE_LAYER])
  disablePointerEvents([PROTOTYPE_LAYER])
  raiseLayer(HIGHLIGHT_LAYER)
})

document.getElementById('movement-button').addEventListener('click', () => {
  selectSideTitle('#porous-giardini-button')
  selectSubSection('#movement-button')
  showLayers([HIGHLIGHT_LAYER, MOVEMENT_LAYER])
  disablePointerEvents([MOVEMENT_LAYER])
})

document.getElementById('uses-button').addEventListener('click', () => {
  selectSideTitle('#porous-giardini-button')
  selectSubSection('#uses-button')
  showLayers([HIGHLIGHT_LAYER, USES_LAYER])
  disablePointerEvents([USES_LAYER])
  raiseLayer(HIGHLIGHT_LAYER)
})

document.getElementById('appearance-button').addEventListener('click', () => {
  selectSideTitle('#porous-giardini-button')
  selectSubSection('#appearance-button')
  showLayers([HIGHLIGHT_LAYER, APPEARANCE_LAYER])
  disablePointerEvents([APPEARANCE_LAYER])
  raiseLayer(HIGHLIGHT_LAYER)
})

document.getElementById('materiality-button').addEventListener('click', () => {
  selectSideTitle('#porous-giardini-button')
  selectSubSection('#materiality-button')
  showLayers([HIGHLIGHT_LAYER, MATERIALITY_LAYER])
  disablePointerEvents([MATERIALITY_LAYER])
  raiseLayer(HIGHLIGHT_LAYER)
})

const viewer = OpenSeadragon({
  id: 'model',
  prefixUrl: './model_files/',
  tileSources: './model.dzi',

  showNavigationControl: false,
  showZoomControl: false,
  showFullPageControl: false,

  animationTime: 1,
  springStiffness: 30,
  zoomPerClick: 1, // effectively disable click to zoom

  // disabled when in edit mode
  mouseNavEnabled,
})

// SIDE NAV
const openNav = () => document.getElementById("mySidenav").style.width = "28%"
const closeNav = () => {
  if (selectedOutline) {
    unfreezeOutline()
  }
  document.getElementById("mySidenav").style.width = "0"
}

// return the thumb url for a given image url
const thumb = path => {
  const tmp = path.split('/')
  tmp.splice(2, 0, 'thumbs')
  return tmp.join('/')
}

// OUTLINES
let selectedOutline = null
const setMainImg = url => {
  $('#main-img').attr('src', url)
  $('#main-img-link').attr('href', url)
}
const setSidebarStudent = studentData => {
  setMainImg(studentData.main_image)
  $('#project-description').text(studentData.description)
  const images = [studentData.main_image, ...studentData.extra_images]
  const container = d3.select('#extra-images')
  container.selectAll('*').remove()
  const imgs = container.selectAll('div.img')
    .data(images)
    .join('div')
      .attr('class', (d,i) => i === 0 ? 'img selected-thumbnail' : 'img')
      .style('background-image', d => `url("${thumb(d)}")`)
      .style('cursor', 'pointer')
      .on('click', function(d) {
        $(this).parent().find('.selected-thumbnail').removeClass('selected-thumbnail')
        $(this).addClass('selected-thumbnail')
        setMainImg(d)
      })
}

const freezeAllHighlightTitles = () => {

}

const freezeAllHighlights = () => {
  d3.selectAll(`#${HIGHLIGHT_LAYER} path`)
    .style('visibility', 'visible')
    .on('mouseout', null)
}

const unfreezeAllHighlights = () => {
  d3.selectAll(`#${HIGHLIGHT_LAYER} path`)
    .style('visibility', 'hidden')
    .on('mouseout', onOutlineOut)
}

const freezeOutline = outlineId => {
  d3.select(`#${outlineId}`)
    .style('visibility', 'visible')
    .on('mouseout', null)
  selectedOutline = outlineId
}

const onOutlineOver = function() {
  d3.select(this).style('visibility', 'visible')
}

const onOutlineOut = function() {
  d3.select(this).style('visibility', 'hidden')
}

// unfreeze the globally selected outline
// if outlineId provided, unfreeze provided outlineId instead
const unfreezeOutline = outlineId => {
  if (outlineId) {
    d3.select(`#${outlineId}`)
      .style('visibility', 'hidden')
      .on('mouseout', onOutlineOut)
    if (outlineId === selectedOutline) {
      selectedOutline = null
    }
  } else if (selectedOutline) {
    d3.select(`#${selectedOutline}`)
      .style('visibility', 'hidden')
      .on('mouseout', onOutlineOut)
    selectedOutline = null
  }
}

// for old biulding outlines
//const selectOutline = (data, outlineId) => {
//  const parts = outlineId.split('_')
//  const name = parts[parts.length-1]
//  // find corresponding data
//  const [student] = data.filter(d => d.name === name)
//  if (selectedOutline) {
//    unfreezeOutline()
//  }
//  freezeOutline(outlineId)
//  setSidebarStudent(student)
//  openNav()
//}

const selectOutline = (data, name) => {
  // find corresponding data
  const [student] = data.filter(d => d.name === name)
  if (selectedOutline) {
    unfreezeOutline()
  }
  freezeOutline(name)
  setSidebarStudent(student)
  openNav()
}

const setMatrix = (selection, mat) =>
  selection.attr(
    'transform',
    `matrix(${mat.a},${mat.b},${mat.c},${mat.d},${mat.e},${mat.f})`,
  )

const raiseLayer = layerId => d3.select(`#${layerId}`).raise()

const enablePointerEvents = layerIds =>
  layerIds.forEach(id => d3.select(`#${id}`).style('pointer-events', 'all'))
const disablePointerEvents = layerIds =>
  layerIds.forEach(id => d3.select(`#${id}`).style('pointer-events', 'none'))

const showLayers = layerIds => {
  d3.selectAll('.'+LAYER_CLASS).attr('display', 'none')
  layerIds.forEach(id => showLayer(id))
}

const showLayer = layerId => d3.select('#' + layerId).attr('display', 'inherit')

const hideLayer = layerId => d3.select('#' + layerId).attr('display', 'none')

const addToLayerEditor = layerId => {
  const container = d3.select(document.getElementById('editor-container'))
  const layer = container.append('div')
    .attr('class', 'layer')
  const checkbox = layer.append('input')
    .attr('type', 'checkbox')
  checkbox.on('change', function(e) {
    if (this.checked) {
      showLayer(layerId)
    } else {
      hideLayer(layerId)
    }
  })
  layer.append('span')
    .text(layerId)
}

async function loadEditor(root, container) {
  let showAll = false
  // set container to manually-determined transform
  let mat = root.node().getScreenCTM().inverse()
  mat = container.node().transform.baseVal.consolidate().matrix

  // create edit tools
  const svg = d3.select(root.node().parentNode)
  container.call(
    d3.drag()
      .on('drag', function() {
        const pt = svg.node().createSVGPoint()
        pt.x = d3.event.x
        pt.y = d3.event.y
        const tpt = pt.matrixTransform(mat.inverse()) // transformed point
        mat = mat.translate(tpt.x, tpt.y)
        setMatrix(d3.select(this), mat)
        console.log(this)
      })
  )
  document.addEventListener('keydown', e => {
    if (e.code === 'ArrowUp') {
      mat = mat.scale(1.01)
      setMatrix(container, mat)
      console.log(container.node())
    }
    if (e.code === 'ArrowDown') {
      mat = mat.scale(.99)
      setMatrix(container, mat)
      console.log(container.node())
    }
    if (e.code === 'KeyE') {
      mouseNavEnabled = !mouseNavEnabled
      viewer.setMouseNavEnabled(mouseNavEnabled)
      console.log(container.node())
    }
    if (e.code === 'KeyW') {
      mat = mat.translate(0,-.5)
      setMatrix(container, mat)
      console.log(container.node())
    }
    if (e.code === 'KeyS') {
      mat = mat.translate(0,.5)
      setMatrix(container, mat)
      console.log(container.node())
    }
    if (e.code === 'KeyA') {
      mat = mat.translate(-.5,0)
      setMatrix(container, mat)
      console.log(container.node())
    }
    if (e.code === 'KeyD') {
      mat = mat.translate(.5,0)
      setMatrix(container, mat)
      console.log(container.node())
    }
    if (e.code === 'KeyT') {
      if (showAll) {
        d3.selectAll('[id^="Outline_x5F_"]')
          .style('visibility', 'hidden')
          .style('pointer-events', 'all')
        showAll = false
      } else {
        d3.selectAll('[id^="Outline_x5F_"]')
          .style('visibility', 'visible')
          .style('pointer-events', 'none')
        showAll = true
      }
    }
  })
}

// INIT
async function init() {
  // Get data
  const data = await d3.json('./data/data.json')

  const overlay = d3.select(viewer.svgOverlay().node())
  $(window).resize(() => viewer.svgOverlay().resize())

  /* Building outlines */
  //const outlines = await d3.xml('./outlines.svg')
  //const outlineContainer = overlay.append('g')
  //d3.select(outlines).selectAll('g')
  //  .each(function() {
  //    outlineContainer.node().appendChild(this)
  //  })

  //// Quadrant selector for elements with ids like '#Outline_x5F_Anna'
  //d3.selectAll(`[id^="${OUTLINE_ID_PREFIX}"]`)
  //  .style('visibility', 'hidden')
  //  .style('pointer-events', 'all')
  //  .on('mouseover', onOutlineOver)
  //  .on('mouseout', onOutlineOut)
  //  .on('click', function() { selectOutline(data, d3.select(this).attr('id')) })

  //// Set outlines to manually-determined position
  //outlineContainer.attr(
  //  'transform',
  //  'matrix(0.0014075787724075425,0,0,0.0014075787724075425,0.1329509883327092,0.014575898199770098)',
  //)

  /* Area outlines */
  const allLayers = await d3.xml('./media/all-layers.svg')
  const container = overlay.append('g')
    .attr('class', 'all-layers')
  d3.select(allLayers).selectAll('g')
    .each(function() {
      if (editMode) {
        addToLayerEditor(d3.select(this).attr('id'))
      }
      d3.select(this)
        .attr('display', 'none')
        .attr('class', LAYER_CLASS)
      container.node().appendChild(this)
    })

  d3.select(`#${HIGHLIGHT_LAYER}`)
    .attr('display', 'inherit')
  d3.selectAll(`#${HIGHLIGHT_LAYER} path`)
    .style('visibility', 'hidden')
    .style('pointer-events', 'all')
    .style('cursor', 'pointer')
    .on('mouseover', onOutlineOver)
    .on('mouseout', onOutlineOut)
    .on('click', function() { selectOutline(data, d3.select(this).attr('id')) })

  container.attr(
    'transform',
    'matrix(0.00014806529758314886,0,0,0.00014806529758314886,0.06574598497802153,0.030329712997314174)'
  )

  if (editMode) {
    loadEditor(overlay, container)
  }
}
$(document).ready(() => init())
