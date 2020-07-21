const addLetal = obj => {
    obj['letal'] = (obj.TotalDeaths / obj.TotalConfirmed * 100).toFixed(2) + '%'
    return obj
}
const clean = obj => {
    let {Country,Confirmed,Deaths,Date} = obj
    return {Country,Confirmed,Deaths,Date}
}

const baseUrl = 'https://api.covid19api.com/country/'
const seq = ['global', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo']


export function range(fim) {
    let array = []
    for (let i = 1; i <= fim; i++) {
        array.push(i)
    }
    return array
}

export function depoisNcaso(data, num) {
    data.forEach(obj => {
        found = obj.y.find(function(element) { return element >= num })
        index = obj.y.indexOf(found)
        for (let i = 0; i < index; i++) {
            obj.x.shift()
            obj.y.shift()
        }

    })

    let menorarray = []
    for (let i = 0; i < data.length; i++) {
        menorarray.push(data[i].y.length)
    }
    menorarray.sort(function(a, b) { return a - b })

    data.forEach(obj => {
        obj.x = range(menorarray[0])
        obj.y.splice(menorarray[0])
    })
    return [data, menorarray[0]]
}

export function prepTrace(array, eixo, index, nome) {
    let dia
    let trace = {
        x: [], //'Array com data ou dias'
        y: [], //'Array com casos'
        mode: 'lines',
        name: nome,
        line: { color: cor[index], width: 3 }
    }
    if (eixo == 'Dia') {
        dia = 1
        array.forEach(obj => {
            trace.x.push(dia++)
            trace.y.push(obj.Casos)
        })
    }

    if (eixo === 'Data') {
        array.forEach(obj => {
            trace.x.push(obj.Data)
            trace.y.push(obj.Casos)
        })
    }
    return trace

}

export function toDaily(array) {
    let day, newArray = [{'Casos': 0}];
    for ( var i = 0; i < array.length; i++ ) {
        if (i > 0 ) {
            day = array[i].Casos - array[i-1].Casos
            newArray.push({'Casos':day > 0 ? day : 0})
        }
    }
    return newArray
}

export async function fetchApi(endpoint) {
    const res = await fetch(endpoint)
    const data = await res.json()
    return data
}

export function filterdaily(data,vars,afterN) {
    let array, pais, newData = [], newArray = []
    for(var i=0;i < data.length;i++) {
        array = data[i] // para cada pais
        array.forEach(obj => {
            if(obj[vars[0]] > afterN) newData.push({'Casos' :  obj[vars[0]]})
        })
        pais = array[0].Country
        newArray.push({pais,'casosarray' : newData})
        newData = []
    }
    
    return newArray
};

export function topCasos(dados,n) { // fixado n = 7
    let newArray = []
    dados.forEach(function(obj) {
            newArray.push(obj)
            if (newArray.length > n) {
                newArray.sort(function(a, b) { return b.TotalConfirmed - a.TotalConfirmed })
                newArray.pop()
            }
        })
    for(let i=1; i<newArray.length; i++) {
        newArray[i]['order'] = seq[i]
    }
    return newArray
}

export function showCard(array) { //// EDITAR ///
    for(let k=0;k<array.length;k++) {
        /// get right obj
        const obj = array.filter(obj => {obj.order = seq[k]})
        obj = addLetal(obj)

        if (seq[k] !== 'global') { // pois Global nao tem o nome na base
            card = document.getElementById(seq[k])
            card.textContent = obj.Country
        }
        card = document.getElementById(seq[k] + 'casos')
        card.className += "float-right";
        card.textContent = obj.TotalConfirmed.toLocaleString()
        card = document.getElementById(seq[k] + 'mortes')
        card.className += "float-right";
        card.textContent = obj.TotalDeaths.toLocaleString()
        card = document.getElementById(seq[k] + 'letal')
        card.className += "float-right";
        card.textContent = obj.letal
    }
    
}

export function pocketSize(array) {
    array.forEach(obj => { clean(obj) })
}