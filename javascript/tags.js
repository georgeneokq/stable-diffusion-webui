(function() {
  const promptTextareaQuery = '#txt2img_prompt textarea'
  const extraNetworksButtonQuery = '#txt2img_extra_networks'
  const lorasContainerQuery = '#txt2img_lora_cards'
  const loraNamesQuery = `${lorasContainerQuery} .card span.name`

  const red = '#d91d0f'
  const green = 'green'

  function delay(ms){return new Promise(resolve => setTimeout(resolve, ms))}

  function applyStyles(element, styles) {
    Object.assign(element.style, styles)
  }

  function getLoraButtonId(loraName) {
    return `lora-button-${loraName}`
  }

  function getLoraTagsContainerId(loraName) {
    return `tags-container-${loraName}`
  }

  // Simulate a `keyup` event to work with storage.js
  function simulateKeyup(target) {
      let e = new Event("keyup", {bubbles: true});
      Object.defineProperty(e, "target", {value: target});
      target.dispatchEvent(e);
  }

  async function onGradioAppLoaded(){ 
    // Wait for app to fully load
    await delay(100);
    while (!gradioApp().getElementById('txt2img_prompt')) {
      await delay(200)
    }
    
    const textarea = gradioApp().querySelector(promptTextareaQuery)

    // Get list of Lora from the Lora tab.
    // Gradio uses a websocket connection to generate the lora selection HTML on the server side.
    // Extra networks HTML is only loaded when the tab is clicked.
    // Simulate a click to retrieve the data from the extra networks container
    const extraNetworksButton = gradioApp().querySelector(extraNetworksButtonQuery)
    extraNetworksButton.click()
    
    // Once models have been loaded, click the button again to hide the extra networks container
    while (!gradioApp().querySelector(lorasContainerQuery)) {
      await delay(100)
    }
    extraNetworksButton.click()

    // Get lora name list
    const loras = Array.from(gradioApp().querySelectorAll(loraNamesQuery)).map((element) => element.innerText.trim())

    // Get lora metadata
    const metadataResponseObjects = await Promise.all(loras.map((lora) => fetch(`/sd_extra_networks/metadata?page=lora&item=${lora}`)))
    const metadataObjects = await Promise.all(metadataResponseObjects.map((response) => response.json()))

    // Map name of lora to metadata. Also filter out keys with empty metadata
    const metadataMap = Object.fromEntries(metadataObjects.map((object, index) => [loras[index], object]).filter(([_, object]) => Object.keys(object).length > 0))
    
    // Each object nests a metadata property which contains a JSON string. Transform them into top-level javascript objects
    Object.keys(metadataMap).forEach((key) => {
      metadataMap[key] = JSON.parse(metadataMap[key].metadata)
    })

    // Function to find the position of the lora
    const getLoraPosition = (loraName) => {
      const prompt = textarea.value
      const regex = new RegExp(`\\<lora:${loraName}:[\\.\\d]+\\>`)
      const match = regex.exec(prompt)
      
      if(match) {
        const startIndex = match.index
        const matchedLength = match[0].length
        return [startIndex, startIndex + matchedLength]
      }
    }

    // Function to check if lora is already applied in prompt
    const isLoraApplied = (loraName) => {
      return !!getLoraPosition(loraName)
    }

    // Create tags container
    const parentContainer = document.createElement('div')

    applyStyles(parentContainer, {
      display: 'flex',
      flexDirection: 'column'
    })

    const parentContainerHeader = document.createElement('h1')
    parentContainerHeader.innerText = 'Lora tags'
    applyStyles(parentContainerHeader, {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '15px'
    })

    parentContainer.append(parentContainerHeader)
    
    // Create container for each lora
    const metadataEntries = Object.entries(metadataMap)
    metadataEntries.forEach(async ([loraName, metadata], index) => {
      // Attach a header button to label the lora, and also function to add the lora to the prompt
      // if not already added.
      const loraHeaderButton = document.createElement('button')
      loraHeaderButton.id = getLoraButtonId(loraName)
      loraHeaderButton.innerText = loraName
      loraHeaderButton.addEventListener('click', () => {
        if(isLoraApplied(loraName)) {
          // If lora already applied, remove from prompt
          const [indexStart, indexEnd] = getLoraPosition(loraName)
          const prompt = textarea.value
          const newPrompt = `${prompt.substr(0, indexStart)}${prompt.substr(indexEnd + 1)}`
          textarea.value = newPrompt
        } else {
          // If lora not applied, add it to prompt
          textarea.value = `${textarea.value} <lora:${loraName}:1>`
        }

        // Notify gradio
        updateInput(textarea)

        // For compatibility with storage.js for saving inputs in localStorage
        simulateKeyup(textarea)
      })

      applyStyles(loraHeaderButton, {
        alignSelf: 'self-start',
        backgroundColor: isLoraApplied(loraName) ? red : green,
        color: 'white',
        padding: '5px 10px',
        marginBottom: '5px',
        borderRadius: '5px'
      })

      parentContainer.append(loraHeaderButton)

      // Create tags container
      const tagsContainer = document.createElement('div')
      tagsContainer.id = getLoraTagsContainerId(loraName)
      applyStyles(tagsContainer, {
        display: isLoraApplied(loraName) ? 'block' : 'none',
        padding: '10px 0',
        borderTop: index > 0 ? '1px solid black' : '',
        borderBottom: index < metadataEntries.length ? '1px solid black' : '',
        marginBottom: '5px'
      })

      // Append buttons for each tag
      const tags = Object.entries(metadata.ss_tag_frequency)
      
      // Each "tag" is a mapping of a group name to frequency.
      // Group name probably used internally in the lora to group images of a certain style together.
      // The group names are usually not meaningful, like 3_uniform, 6_outfit2, 6_outfit4
      tags.forEach(([groupName, frequencyMapping]) => {
        // Append header for group name
        const header = document.createElement('h1')
        header.innerText = groupName
        applyStyles(header, {
          fontWeight: 600
        })
        tagsContainer.append(header)

        // For each item in the frequency mapping, append a button to the tags container
        Object.entries(frequencyMapping).map(([tagName, frequency]) => [tagName.trim(), frequency])
                                        .sort((([tagName1], [tagName2]) => tagName1.localeCompare(tagName2)))
                                        .forEach(([tagName, frequency]) => {
          const button = document.createElement('button')
          button.type = 'button'
          button.innerText = `${tagName} (${frequency})`
          applyStyles(button, {
            padding: '0 5px',
            border: '1px solid black',
            borderRadius: '5px',
            boxShadow: '1px 1px',
            margin: '0 5px 5px 0'
          })
  
          button.addEventListener('click', () => {
            textarea.value = `${textarea.value}${textarea.value.trimEnd().endsWith(',') ? '' : ', '}${tagName}`
            updateInput(textarea)
          })
  
          tagsContainer.append(button)
        })
      })
      
      parentContainer.append(tagsContainer)
    })

    // Register change listener for prompt, constantly check if tag containers should be displayed or hidden
    textarea.addEventListener('input', (e) => {
      // Check for names here
      const loraNames = Object.keys(metadataMap)
      loraNames.forEach((loraName) => {
        const loraButton = gradioApp().getElementById(getLoraButtonId(loraName))
        const tagsContainer = gradioApp().getElementById(getLoraTagsContainerId(loraName))
        if(isLoraApplied(loraName)) {
          loraButton.style.backgroundColor = red
          tagsContainer.style.display = 'block'
        } else {
          loraButton.style.backgroundColor = green
          tagsContainer.style.display = 'none'
        }
      })
    })

    const parent = gradioApp().querySelector('#txt2img_toprow').parentNode
    parent.prepend(parentContainer)
  }
  
  document.addEventListener("DOMContentLoaded", async function() {await onGradioAppLoaded()})
})()
