// All in context of using querySelector()
const dropdownsQuery = ".border-none.svelte-aqlk7e"
const samplingMethodQuery = `#txt2img_sampling ${dropdownsQuery}`
const txt2imgGenerateQuery = "#txt2img_generate"
const promptQuery = '#txt2img_prompt textarea'
const negativePromptQuery = '#txt2img_neg_prompt textarea'
const samplingStepsRangeQuery = "#range_id_0"
const samplingStepsTextQuery = '#txt2img_steps input[type=number]'
const widthTextQuery = '#txt2img_width input[type=number]'
const widthRangeQuery = '#range_id_6'
const heightTextQuery = '#txt2img_height input[type=number]'
const heightRangeQuery = '#range_id_7'
const batchCountQuery = '#range_id_8'
const batchSizeQuery = '#range_id_9'
const cfgScaleRangeQuery = '#range_id_10'
const cfgScaleTextQuery = '#txt2img_cfg_scale input[type=number]'
const seedQuery = '#txt2img_seed input[type=number]'
const triggerElementId = 'range_id_0'

function delay(ms){return new Promise(resolve => setTimeout(resolve, ms))}

function keyupListener(storageKey) {
  return function(e) {
    const target = e.target
    localStorage.setItem(storageKey, target.value)
  }
}

async function restoreFromStorage(storageKey, ...elements) {
  const storedItem = localStorage.getItem(storageKey)
  if(storedItem) {
    for(const element of elements) {
      element.value = storedItem
      updateInput(element)
    }
  }
}

async function onGradioAppLoaded(){ 
  // Wait for app to fully load
  await delay(100);
  while (!gradioApp().getElementById(triggerElementId)) {
    await delay(200)
  }

  const samplingMethodInput = gradioApp().querySelector(samplingMethodQuery)
  const promptInput = gradioApp().querySelector(promptQuery)
  const negativePromptInput = gradioApp().querySelector(negativePromptQuery)
  const samplingStepsRangeInput = gradioApp().querySelector(samplingStepsRangeQuery)
  const samplingStepsTextInput = gradioApp().querySelector(samplingStepsTextQuery)
  const widthRangeInput = gradioApp().querySelector(widthRangeQuery)
  const widthTextInput = gradioApp().querySelector(widthTextQuery)
  const heightRangeInput = gradioApp().querySelector(heightRangeQuery)
  const heightTextInput = gradioApp().querySelector(heightTextQuery)
  const batchCountInput = gradioApp().querySelector(batchCountQuery)
  const batchSizeInput = gradioApp().querySelector(batchCountQuery)
  const cfgScaleRangeInput = gradioApp().querySelector(cfgScaleRangeQuery)
  const cfgScaleTextInput = gradioApp().querySelector(cfgScaleTextQuery)
  const seedInput = gradioApp().querySelector(seedQuery) 

  // Register event listeners to save inputs to localStorage.
  // Don't use 'input' listener because gradio uses that to update input changes internally.
  // TLDR; Using 'input' listener causes infinite recursion
  samplingMethodInput.addEventListener('keyup', keyupListener('sampling_method'))
  promptInput.addEventListener('keyup', keyupListener('prompt'))
  negativePromptInput.addEventListener('keyup', keyupListener('negative_prompt'))
  samplingStepsRangeInput.addEventListener('keyup', keyupListener('sampling_steps'))
  samplingStepsTextInput.addEventListener('keyup', keyupListener('sampling_steps'))
  widthRangeInput.addEventListener('keyup', keyupListener('width'))
  widthTextInput.addEventListener('keyup', keyupListener('width'))
  heightRangeInput.addEventListener('keyup', keyupListener('height'))
  heightTextInput.addEventListener('keyup', keyupListener('height'))
  batchCountInput.addEventListener('keyup', keyupListener('batch_count'))
  batchSizeInput.addEventListener('keyup', keyupListener('batch_size'))
  cfgScaleRangeInput.addEventListener('keyup', keyupListener('cfg_scale'))
  cfgScaleTextInput.addEventListener('keyup', keyupListener('cfg_scale'))
  seedInput.addEventListener('keyup', keyupListener('seed'))

  // Restore from local storage
  restoreFromStorage('prompt', promptInput)
  restoreFromStorage('negative_prompt', negativePromptInput)
  restoreFromStorage('sampling_steps', samplingStepsRangeInput, samplingStepsTextInput)
  restoreFromStorage('width', widthRangeInput, widthTextInput)
  restoreFromStorage('height', heightRangeInput, heightTextInput)
  restoreFromStorage('batch_count', batchCountInput)
  restoreFromStorage('batch_size', batchSizeInput)
  restoreFromStorage('cfg_scale', cfgScaleRangeInput, cfgScaleTextInput)
  restoreFromStorage('seed', seedInput)
  
  // Currently pointless to restore sampling_method.
  // Dropdowns created by gradio use <ul> and 'click' event does not
  // help to select it programatically.

  // restoreFromStorage('sampling_method', samplingMethodInput)

  // Add extra buttons
  const buttonContainer = gradioApp().querySelector('#image_buttons_txt2img')

  // Clear localStorage
  const buttonClasses = 'lg secondary gradio-button svelte-1ipelgc'
  const button = document.createElement('button')
  button.innerText = 'Restore defaults'
  button.title = 'Click and reload page to restore default values'
  button.className = buttonClasses
  button.onclick = function() {
    localStorage.removeItem('sampling_method')
    localStorage.removeItem('prompt')
    localStorage.removeItem('negative_prompt')
    localStorage.removeItem('sampling_steps')
    localStorage.removeItem('width')
    localStorage.removeItem('height')
    localStorage.removeItem('batch_count')
    localStorage.removeItem('batch_size')
    localStorage.removeItem('cfg_scale')
    localStorage.removeItem('seed')
  }
  buttonContainer.appendChild(button)
}

document.addEventListener("DOMContentLoaded", async function() {await onGradioAppLoaded()})
