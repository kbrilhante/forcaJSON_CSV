function inicialize() {
    document.querySelector('#inpFile').onchange = submit;
    document.querySelector('#txtOutputJSON').oninput = () => {
        createCheck('btnCheckJSON', '#controlButtonsJSON', changeJSON);
    };
    document.querySelector('#txtOutputCSV').oninput = () => {
        createCheck('btnCheckCSV', '#controlButtonsCSV', changeCSV);
    };
}

function submit(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        getFile(file.type, reader.result)
    };
    reader.readAsText(file);
}

function getFile(type, result) {
    let object;    
    if (type == 'application/json') {
        object = handleJSON(result);
    } else if (type == 'text/csv') {
        object = handleCSV(result);
    }
    setOutput(object)
}

function createCheck(id, groupId, callback){
    let btn = document.getElementById(id);
    if (!btn) {
        const group = document.querySelector(groupId);
        btn = setButton('fa-solid fa-check');
        btn.id = id;
        btn.onclick = callback;
        group.prepend(btn);
    }

}

function changeJSON(e) {
    console.log('click', e)
    // const object = handleJSON(e.target.value);
    // setOutput(object);
}

function changeCSV(e) {
    const aaaa = document.querySelectorAll('.btn-group')
    console.log(aaaa)
    // const object = handleCSV(e.target.value);
    // setOutput(object);
}

function setOutput(object) {
    removeDuplicates(object);
    newJSON(object);
    newCSV(object);
}

function handleJSON(data) {
    const object = JSON.parse(data);
    return object;
}

function handleCSV(data) {
    data = data.split('\n')
    const object = {};
    for (let i = 1; i < data.length; i++) {
        const line = data[i].split(',');
        if (line.length > 1) {
            const key = line[1];
            const element = line[2];
            if (!Object.keys(object).includes(key)) object[key] = [];
            object[key].push(element);
        }
    }
    return object;
}

function removeDuplicates(object) {
    // also change it all to upper case
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            const array = object[key];
            const new_array = [];
            for (const element of array) {
                let word = element.toUpperCase()
                if (!new_array.includes(word)) new_array.push(word)
            }
            object[key] = new_array;
        }
    }
}

function newJSON(object) {
    let lines = [];
    let strJSON = '\{\n';
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            const element = object[key];
            let line = '    \"' + key + '\": \[\n        \"';
            line += element.join('", "');
            line += '\"\n    \]';
            lines.push(line)
        }
    }
    strJSON += lines.join(',\n');
    strJSON += '\}';
    document.querySelector('#txtOutputJSON').value = strJSON;
    buttonGroup('controlButtonsJSON', strJSON, 'application/json');
}

function newCSV(object) {
    const lines = ['id, categoria, palavra']
    let id = 1;
    for (const categoria in object) {
        if (Object.prototype.hasOwnProperty.call(object, categoria)) {
            const element = object[categoria];
            for (const palavra of element) {
               let line = [];
               line.push(id++);
               line.push(categoria);
               line.push(palavra)
               lines.push(line.join(','));
            }
        }
    }
    const strCSV = lines.join('\n');
    document.querySelector('#txtOutputCSV').value = strCSV;
    buttonGroup('controlButtonsCSV', strCSV, 'text/csv');
}

function buttonGroup(containerId, text, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const btnCpy = setButton('fa-solid fa-copy');
    btnCpy.onclick = () => {
        copyText(text);
    }
    const btnDown = setButton('fa-solid fa-download');
    btnDown.onclick = () => {
        download(text, type);
    }
    container.appendChild(btnCpy);
    container.appendChild(btnDown);
}

function setButton(icon) {
    const btn = document.createElement('button');
    const i = document.createElement('i');
    btn.className = 'btn btn-secondary';
    i.className = icon;
    btn.appendChild(i);
    return btn;
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(
        () => {
            console.log('Copiado com sucesso');
            alert('Copiado com sucesso');
        },
        err => {
            console.error(err);
        }
    )
}

function download(text, type) {
    const blob = new Blob([text], {type: type});
    const ext = type.split('/')[1];
    const fileName = 'download.' + ext;
    const downLink = document.createElement('a');
    downLink.download = fileName;
    if (webkitURL != null) {
        downLink.href = webkitURL.createObjectURL(blob);
    } else {
        downLink.href = URL.createObjectURL(blob);
        downLink.onclick = destroyClickedElement;
        downLink.style.display = 'none';
        document.body.appendChild(downLink);
    }
    downLink.click();
}

inicialize()