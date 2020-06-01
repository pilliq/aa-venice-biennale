const OUTLINE_ID_PREFIX = 'Outline_x5F_'
const editMode = false
let mouseNavEnabled = !editMode

const selectSideTitle = selector => {
  $('.selected-title').removeClass('selected-title')
  $(selector).addClass('selected-title')
}

const slt = new SimpleLightbox('#giardini-today-gallery a', {
  captionSelector: 'self',
  captionPosition: 'outside',
  maxZoom: 20,
});
$('#giardini-today-gallery a').on('close.simplelightbox', function () {
  console.log('closed')
})

document.getElementById('porous-giardini-button').addEventListener('click', () => {
  selectSideTitle('#porous-giardini-button')
})

document.getElementById('giardini-intervene-button').addEventListener('click', () => {
  selectSideTitle('#giardini-intervene-button')
})

document.getElementById('giardini-today-button').addEventListener('click', () => {
  selectSideTitle('#giardini-today-button')
  slt.open();
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

// MODAL
var modal = document.getElementById("on-load-modal");
var modal_close = document.getElementsByClassName("modal-close")[0];
modal_close.onclick = function () {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = e => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

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

const freezeOutline = outlineId => {
  d3.select(`#${outlineId}`)
    .style('visibility', 'visible')
    .on('mouseout', null)
  selectedOutline = outlineId
}

const onOutlineOver = function() { d3.select(this).style('visibility', 'visible') }
const onOutlineOut = function() { d3.select(this).style('visibility', 'hidden') }

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

const selectOutline = (data, outlineId) => {
  const parts = outlineId.split('_')
  const name = parts[parts.length-1]
  // find corresponding data
  const [student] = data.filter(d => d.name === name)
  if (selectedOutline) {
    unfreezeOutline()
  }
  freezeOutline(outlineId)
  setSidebarStudent(student)
  openNav()
}

// INIT
async function init() {
  let showAll = false

  // Get data
  const data = await d3.json('./data/data.json')

  const overlay = d3.select(viewer.svgOverlay().node())
  $(window).resize(() => viewer.svgOverlay().resize())

  const setMatrix = (selection, mat) => {
    selection.attr('transform', `matrix(${mat.a},${mat.b},${mat.c},${mat.d},${mat.e},${mat.f})`)
  }

  const outlines = await d3.xml('./outlines.svg')
  const map = overlay.append('g')
  d3.select(outlines).selectAll('g')
    .each(function() {
      map.node().appendChild(this)
    })
  // Quadrant selector for elements with ids like '#Outline_x5F_Anna'
  d3.selectAll(`[id^="${OUTLINE_ID_PREFIX}"]`)
    .style('visibility', 'hidden')
    .style('pointer-events', 'all')
    .on('mouseover', onOutlineOver)
    .on('mouseout', onOutlineOut)
    .on('click', function() { selectOutline(data, d3.select(this).attr('id')) })

  // Set outlines to manually-determined position
  let mat = overlay.node().getScreenCTM().inverse()
  map.attr('transform', 'matrix(0.0014075787724075425,0,0,0.0014075787724075425,0.1329509883327092,0.014575898199770098)')
  mat = map.node().transform.baseVal.consolidate().matrix

  // Edit tools
  if (editMode) {
    const svg = d3.select(overlay.node().parentNode)
    map.call(
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
        setMatrix(map, mat)
        console.log(map.node())
      }
      if (e.code === 'ArrowDown') {
        mat = mat.scale(.99)
        setMatrix(map, mat)
        console.log(map.node())
      }
      if (e.code === 'KeyE') {
        mouseNavEnabled = !mouseNavEnabled
        viewer.setMouseNavEnabled(mouseNavEnabled)
        console.log(map.node())
      }
      if (e.code === 'KeyW') {
        mat = mat.translate(0,-.5)
        setMatrix(map, mat)
        console.log(map.node())
      }
      if (e.code === 'KeyS') {
        mat = mat.translate(0,.5)
        setMatrix(map, mat)
        console.log(map.node())
      }
      if (e.code === 'KeyA') {
        mat = mat.translate(-.5,0)
        setMatrix(map, mat)
        console.log(map.node())
      }
      if (e.code === 'KeyD') {
        mat = mat.translate(.5,0)
        setMatrix(map, mat)
        console.log(map.node())
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
}
$(document).ready(() => init())
