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

function saveToStorage(storageKey) {
  return function(e) {
    const element = e.target
    localStorage.setItem(storageKey, element.value)
  }
}

async function restoreFromStorage(storageKey, ...elements) {
  const storedItem = localStorage.getItem(storageKey)
  if(storedItem) {
    for(const element of elements) {
      element.value = storedItem
    }
  }
}

async function fire(){ 
  await delay(100);
  while (!gradioApp().getElementById(triggerElementId)) {
    await delay(200)
  }

  //specify what you want to do once the while loop breaks, you might not even need the delay, but it reduces load
  //to have some time out
  const txt2imgGenerateButton = document.querySelector(txt2imgGenerateQuery)
  const samplingMethodInput = document.querySelector(samplingMethodQuery)
  const promptInput = document.querySelector(promptQuery)
  const negativePromptInput = document.querySelector(negativePromptQuery)
  const samplingStepsRangeInput = document.querySelector(samplingStepsRangeQuery)
  const samplingStepsTextInput = document.querySelector(samplingStepsTextQuery)
  const widthRangeInput = document.querySelector(widthRangeQuery)
  const widthTextInput = document.querySelector(widthTextQuery)
  const heightRangeInput = document.querySelector(heightRangeQuery)
  const heightTextInput = document.querySelector(heightTextQuery)
  const batchCountInput = document.querySelector(batchCountQuery)
  const batchSizeInput = document.querySelector(batchCountQuery)
  const cfgScaleRangeInput = document.querySelector(cfgScaleRangeQuery)
  const cfgScaleTextInput = document.querySelector(cfgScaleTextQuery)
  const seedInput = document.querySelector(seedQuery) 

  // Register event listeners to save inputs to localStorage
  samplingMethodInput.addEventListener('change', saveToStorage('sampling_method'))
  promptInput.addEventListener('change', saveToStorage('prompt'))
  negativePromptInput.addEventListener('change', saveToStorage('negative_prompt'))
  samplingStepsRangeInput.addEventListener('change', saveToStorage('sampling_steps'))
  samplingStepsTextInput.addEventListener('change', saveToStorage('sampling_steps'))
  widthRangeInput.addEventListener('change', saveToStorage('width'))
  widthTextInput.addEventListener('change', saveToStorage('width'))
  heightRangeInput.addEventListener('change', saveToStorage('height'))
  heightTextInput.addEventListener('change', saveToStorage('height'))
  batchCountInput.addEventListener('change', saveToStorage('batch_count'))
  batchSizeInput.addEventListener('change', saveToStorage('batch_size'))
  cfgScaleRangeInput.addEventListener('change', saveToStorage('cfg_scale'))
  cfgScaleTextInput.addEventListener('change', saveToStorage('cfg_scale'))
  seedInput.addEventListener('change', saveToStorage('seed'))

  // Restore from local storage
  restoreFromStorage('sampling_method', samplingMethodInput)
  restoreFromStorage('prompt', promptInput)
  restoreFromStorage('negative_prompt', negativePromptInput)
  restoreFromStorage('sampling_steps', samplingStepsRangeInput, samplingStepsTextInput)
  restoreFromStorage('width', widthRangeInput, widthTextInput)
  restoreFromStorage('height', heightRangeInput, heightTextInput)
  restoreFromStorage('batch_count', batchCountInput)
  restoreFromStorage('batch_size', batchSizeInput)
  restoreFromStorage('cfg_scale', cfgScaleRangeInput, cfgScaleTextInput)
  restoreFromStorage('seed', seedInput)

  // Add extra buttons
  const buttonContainer = document.querySelector('#image_buttons_txt2img')

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

document.addEventListener("DOMContentLoaded", async function() {await fire()})