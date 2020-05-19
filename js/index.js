// FUNCOES PARA TRATAR E APLICAR OS DADOS
var array = []
var x = []
var y = []
var casos = []
var mostrarpais = []
var mostrarid = ['global', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo']
    // rgb em seq com os cards
var cor = ['rgb(60, 143, 60)','rgb(0, 123, 255)','rgb(108, 117, 125)','rgb(23, 162, 184)',
            'rgb(255, 193, 7)','rgb(220, 53, 69)','rgb(52, 58, 64)']
var id = ''
var found, index, card, obj, iniciocontagem = 100

function range(fim) {
    let array = []
    for (let i = 1; i <= fim; i++) {
        array.push(i)
    }
    return array
}

function depoisNcaso(data, num) {
    data.forEach(obj => {
        found = obj.y.find(function(element) { return element >= num })
        index = obj.y.indexOf(found)
        for (let i = 0; i < index; i++) {
            obj.x.shift()
            obj.y.shift()
        }

    })

    let menorarray = []
    for (let i = 0; i < 2; i++) {
        menorarray.push(data[i].y.length)
    }
    menorarray.sort(function(a, b) { return a - b })

    data.forEach(obj => {
        obj.x = range(menorarray[0])
        obj.y.splice(menorarray[0])
    })
    return [data, menorarray[0]]
}


function prepTrace(array, eixo, index, nome) {
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

function f3(data) {
    let dadosG = []

    // criar o dados 
    for (let i = 1; i < 7; i++) {
        dadosG.push(prepTrace(data[i].info, 'Data', i, data[i].name))
            // array com dados, Data ou Dia, index, nome do pais para legenda
    }
    //PRIMEIRO GRAFICO
    Plotly.newPlot(document.getElementById('tester2'), dadosG, { title: 'Casos de COVID-19 nos Países acima desde o dia 22/01' });
    //console.log(dadosG)
    dadosG = []
    for (let i = 1; i < 7; i++) {
        dadosG.push(prepTrace(data[i].info, 'Dia', i, data[i].name))
            // array com dados, Data ou Dia, index, nome do pais para legenda
    }
    // correcao para pais com menos dias de pandemia 
    saida = depoisNcaso(dadosG, iniciocontagem)
    dadosG = saida[0]
    //console.log(dadosG)

    // edit layout

    var layout = {
        title: `Primeiros ${saida[1]} dias de Pandemia nos Países a partir de ${iniciocontagem} Caso(s)`,
        annotations: [
          {
            xref: 'paper',
            yref: 'paper',
            x: 50,
            y: -10,
            xanchor: 'center',
            yanchor: 'top',
            text: 'Source: Pew Research Center & Storytelling with data',
            showarrow: false,
            font: {
              family: 'Arial',
              size: 12,
              color: 'rgb(150,150,150)'
            }
          }
        ]
      };


    //console.log(dadosG)
    Plotly.newPlot(document.getElementById('tester'), dadosG,layout);
}

// CARDS
function f4(dados) {
    // cards
    console.log(dados)
    mostrarpais.push(...dados.Ordem)
        // definir letalidade
    dados.Countries.forEach(obj => {
        obj['letal'] = (obj.TotalDeaths / obj.TotalConfirmed * 100).toFixed(2) + '%'
    })
    for (let index in mostrarid) {
        obj = dados.Countries[index]
        if (index > 0) { // pois Global nao tem o nome na base
            card = document.getElementById(mostrarid[index])
            card.textContent = obj.Country
        }
        card = document.getElementById(mostrarid[index] + 'casos')
        card.className += "float-right";
        card.textContent = obj.TotalConfirmed.toLocaleString()
        card = document.getElementById(mostrarid[index] + 'mortes')
        card.className += "float-right";
        card.textContent = obj.TotalDeaths.toLocaleString()
        card = document.getElementById(mostrarid[index] + 'letal')
        card.className += "float-right";
        card.textContent = obj.letal
    }
}


// FUNCOES PARA CARREGAR OS DADOS
var tmp, tmp2, tmp3, tmp4
var url
const summaryUrl = 'https://api.covid19api.com/summary'
const totalUrl = 'https://api.covid19api.com/total/country/'
    //const casosUrl = '/status/confirmed'
    //const mortesUrl = '/status/deaths'
var newObj = []
var graficoData = []

async function fetchApi(endpoint) {
    const res = await fetch(endpoint)
    const data = await res.json()
    return data
}

function top7Casos(dados) {
    let newArray = []
    dados.forEach(function(obj) {
            newArray.push(obj)
            if (newArray.length > 7) {
                newArray.sort(function(a, b) { return b.TotalConfirmed - a.TotalConfirmed })
                newArray.pop()
            }
        })
        //newArray.unshift(dados.filter(obj => obj.Slug === 'brazil')[0])  adicionar Brasil
    return newArray
}


async function f2(data) {
    // pegar os paises para recolher os dados do Historico
    let pais = []
    let response, thisCountry, trace, obj
    data.Countries.forEach(function(obj) {
        pais.push(obj.Slug)
    })
    data['Ordem'] = []
    data.Ordem.push(...pais)
        // pegar historico
    for (let i in pais) {
        trace = []
        thisCountry = {}
        if (pais[i] !== 'global') {
            url = totalUrl + pais[i] // + casosUrl response.length-1
            response = await fetchApi(url);
            //console.log(response)
            for (let k = 0; k < response.length - 1; k++) {
                obj = response[k]
                trace.push({ 'Data': obj.Date, 'Casos': obj.Confirmed, 'Mortos': obj.Deaths })
            }
            thisCountry['info'] = trace
            thisCountry['name'] = response[0].Country
        }
        graficoData.push(thisCountry)
    }
    graficoData.shift()
        //console.log(graficoData)
    tmp3 = f3(graficoData)
    tmp4 = f4(data)
}

async function f1() {
    let response
    response = await fetchApi(summaryUrl)
    let Cc = top7Casos(response.Countries)
    Cc.unshift({
        'Slug': 'global',
        'TotalConfirmed': response.Global.TotalConfirmed,
        'TotalDeaths': response.Global.TotalDeaths,
        'Date': response.Date
    })
    tmp2 = f2({ 'Countries': Cc })
}

// chamada de funcoes ao iniciar
function eventos() {
    tmp = setTimeout(f1, 100);
};

window.addEventListener("load", eventos);





/*parte do bloco e botoes
var btn;
    function mudaCor() {
        var obj=document.getElementById('div1')
        obj.classList.toggle('alert-danger')
    }

    
    function iniciar(){
        btn=setInterval(mudaCor,3000);
    }

    function parar(){
        clearInterval(btn);
    }

    
    //document.getElementById("btn2").addEventListener("click",parar);
    //tmp=setInterval(state,10000);


function plotBR(key_date , key_country) {
        graphData = [ { x: key_country , y: key_date, mode: 'lines' }]; // data = [ { x1: [ ] , y1: [ ], mode: '' } ]
      
        layout = {title:'Brazil´s confirmed cases after First US Case - 01/22', yaxis: {range: [0, 800000]} };
        
        Plotly.newPlot(document.getElementById('testerBR'), graphData, layout);
};

function plot(plotData) { // recebe um objeto com os paises e suas informacoes
  graphData = [ { x: key_country , y: key_date, mode: 'lines' }]; // data = [ { x1: [ ] , y1: [ ], mode: '' } ]
//console.log(key_date, key_country)
  layout = {title:'US confirmed cases after First Case - 01/22', yaxis: {range: [0, 800000]} };

  Plotly.newPlot(document.getElementById('tester'), graphData, layout);
};
 
function getKeyData(dados, item) {
    //tirar dados 'Country'
    newArray = [];             
    dados.forEach(function(number) {   
        newArray.push(number[item]);
        //console.log(newArray)
    });
    //console.log(newArray)
    return newArray
};

function getBrazilData(dados, Country, Data) {
    //tirar dados 'Brazil'
    newArray = [];
    if(!Data) {
        dados.forEach(function(number) {
            if (number["Country/Region"] == Country) {
                newArray.push(number.Confirmed);
            };
        });
    } else {
        dados.forEach(function(number) {
            if (number["Country/Region"] == "Brazil") {
                newArray.push(number.Date);
            };
        });
    }             
    

    return newArray
};



    // chamar uma funcao para retornar o obj para o grafico de cada pais
                //trace = GraficoPais(response,pais[i])
                // trace = { 'x': x, 'y': y, 'name': pais[i] }


            // console.log(response)
            response.forEach(obj => {
                x.push(obj.Date)
                y.push(obj.Confirmed)
            })
            thisCountry = 
                 GRAFICO DE MORTES
            url = totalUrl+pais[i]+mortesUrl
            response = await fetch(url);
            if (response.ok) {
                    json = await response.json();
                    json.map(obj => {
                        na.push({'Cases': obj.Cases , 'Day': !!obj.Cases ? day++ : 0})
                    })
                thisCountry['Confirmed'] = na.filter(obj => obj.Day > 0)//filtrar a partir do primeiro dia 
           } 
        }
        //console.log(thisCountry)
        
        
        
        
        data.forEach(function(obj, index) {
        // adicionar cor
        obj['line'] = { 'color': cor[index], 'width': 3 }



        // filtrar a partir do caso tal
        obj = depoisNcaso(obj, 1)
        menorUltimoDia.push(obj.x[obj.x.length - 1])
    })
    menorUltimoDia.sort(function(a, b) { return a - b })
    data.forEach(obj => {
            obj.x.splice(menorUltimoDia[0])
            obj.y.splice(menorUltimoDia[0])
        }) */