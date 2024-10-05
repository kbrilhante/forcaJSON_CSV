function inicialize() {
    document.querySelector("#inpFile").onchange = submit;
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
    removeDuplicates(object);
    newJSON(object, type);
    newCSV(object, type);
}

function handleJSON(data) {
    object = JSON.parse(data)
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
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            const array = object[key];
            const new_array = [];
            for (const element of array) {
                if (!new_array.includes(element)) new_array.push(element)
            }
            object[key] = new_array;
        }
    }
}

function newJSON(object) {
    let strJSON = "{\n";
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            const element = object[key];
            strJSON += '    ' + key + ': [\n        \"';
            strJSON += element.join('\", \"');
            strJSON += '\"\n    ],\n';
        }
    }
    strJSON += '}';
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
               lines.push(line.join(', '));
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