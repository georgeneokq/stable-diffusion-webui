(function() {
  const triggerElementId = 'range_id_0'
  const promptTextareaQuery = '#txt2img_prompt textarea'

  function delay(ms){return new Promise(resolve => setTimeout(resolve, ms))}

  function applyStyles(element, styles) {
    Object.assign(element.style, styles)
  }
  
  async function onGradioAppLoaded(){ 
    // Wait for app to fully load
    await delay(100);
    while (!gradioApp().getElementById(triggerElementId)) {
      await delay(200)
    }

    const textarea = gradioApp().querySelector(promptTextareaQuery)

    // Create tags container
    const parentContainer = document.createElement('div')

    applyStyles(parentContainer, {
      display: 'flex',
      flexDirection: 'column'
    })

    // TODO: Fetch actual lora
    const loras = ['lora1', 'lora2']
    
    // Create container for each lora
    loras.forEach(async (lora, index) => {
      // TODO: Fetch lora metadata
      const metadata = await (await fetch(`/sd_extra_networks/metadata?page=lora&item=${lora}`)).text()
      console.log(metadata)

      // Attach a header to label the lora
      const header = document.createElement('h1')
      header.innerText = lora
      parentContainer.appendChild(header)

      // Create tags container
      const tagsContainer = document.createElement('div')
      applyStyles(tagsContainer, {
        padding: '15px 0'
      })

      if(index < loras.length - 1) {
        applyStyles(tagsContainer, {
          borderBottom: '1px solid black',
          marginBottom: '5px'
        })
      }
      
      // Append buttons for each tag
      const tags = ['tag1', 'tag2']
      tags.forEach((tag) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.innerText = tag
        applyStyles(button, {
          padding: '5px 10px',
          border: '1px solid black',
          borderRadius: '5px',
          boxShadow: '1px 1px',
          marginRight: '5px'
        })

        button.onclick = function(e) {
          e.preventDefault()
          textarea.value = `${textarea.value}${textarea.value.trimEnd().endsWith(',') ? '' : ', '}${tag}`
          updateInput(textarea)
        }

        tagsContainer.appendChild(button)
      })
      
      parentContainer.appendChild(tagsContainer)
    })

    const parent = gradioApp().querySelector('#txt2img_toprow').parentNode
    parent.prepend(parentContainer)
  }
  
  document.addEventListener("DOMContentLoaded", async function() {await onGradioAppLoaded()})
})()
