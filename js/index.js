/// vars
const seq = ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo']
const mesDoAno = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 
                  'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const summaryUrl = 'https://api.covid19api.com/summary'
const baseUrl = 'https://api.covid19api.com/total/country/'


// FUNCOES PARA TRATAR E APLICAR OS DADOS
var array = []
var x = []
var y = []
var casos = []
var mostrarpais = []

    // rgb em seq com os cards
var cor = ['rgb(60, 143, 60)','rgb(0, 123, 255)','rgb(108, 117, 125)','rgb(255, 193, 7)',
'rgb(52, 58, 64)','rgb(220, 53, 69)','rgb(23, 162, 184)']
var id = ''
var found, index, card, obj, remover = ['primeiro'], iniciocontagem = 1000

// FUNCOES PARA CARREGAR OS DADOS
var tmp, tmp2, tmp3, tmp4, tmp5
var url, countryCards = 7


//const dailyCountries = ['brazil','italy','spain','india']
    //const casosUrl = '/status/confirmed'
    //const mortesUrl = '/status/deaths'
var newObj = []
var graficoData = []





/// Helper functions
async function fetchApi(endpoint) {
    const res = await fetch(endpoint)
    const data = await res.json()
    return data
}

function addLetal(obj) {
    obj['letal'] = (obj.TotalDeaths / obj.TotalConfirmed * 100).toFixed(2) + '%'
    return obj
}

function clean(array,itemsToKeep) { // editing...
    let newArray = [];
    array.forEach(obj => {
        newArray.push(
            {
               'Country'   : obj.Country,
               'Confirmed' : obj.Confirmed,
               'Deaths'    : obj.Deaths,
               'Date'      : obj.Date
            }
        )
    })
    return newArray
}

function range(fim) {
    let array = []
    for (let i = 1; i <= fim; i++) {
        array.push(i)
    }
    return array
}

function sameSizeTrace(data) {
    let menorarray = []

    data.forEach(obj =>  { // pegar a qtd de dias em cada pais
        menorarray.push(obj.y.length)
    });

    menorarray.sort(function(a, b) { return a - b }) // ordenar

    data.forEach(obj => {   // eliminar dias a mais q o pais com menos dias
        obj.x = range(menorarray[0])   
        obj.y.splice(menorarray[0])
    })
    return data
}

function prepTrace(array, eixoX, index) {
    //console.log(array)
    if(!(eixoX == 'Dia' | eixoX == 'Data')) return `o Eixo de 'X' = ${eixoX} é uma informacao inválida, opções: {'Dia' ou 'Data'}`
    let dia
    let trace = {
        x: [], //'Array com data ou dias'
        y: [], //'Array com casos'
        mode: 'lines',
        name: array[0].Country,
        line: { color: cor[index], width: 3 }
    }
    if (eixoX == 'Dia') {
        //saida = depoisNcaso(dadosG, iniciocontagem)
        dia = 1
        //iniciocontagem = 1 // comentado para ser inicio contagem geral
        array.forEach(obj => {
            if(obj.Confirmed > iniciocontagem) {
                trace.x.push(dia++)
                trace.y.push(obj.Confirmed)
            }
        })
    }
    if (eixoX === 'Data') {
        array.forEach(obj => {
            if(obj.Date >= '2020-03-15'){  // fixei os dados a partir de 15 de março
                trace.x.push(obj.Date)
                trace.y.push(obj.Confirmed)
            }
        })
    }
    return trace
}

function toDaily(array) {
    let day, newArray = [{'Casos': 0}];
    for ( var i = 0; i < array.length; i++ ) {
        if (i > 0 ) {
            day = array[i].Casos - array[i-1].Casos
            newArray.push({'Casos':day > 0 ? day : 0})
        }
    }
    return newArray
}

function filterdaily(data,vars,afterN) {
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

function topCasos(dados,n) { // fixado n = 7 
    let newArray = []
    dados.forEach(function(obj) {
            newArray.push(obj)
            if (newArray.length > n) {
                newArray.sort(function(a, b) { return b.TotalConfirmed - a.TotalConfirmed })
                newArray.pop()
            }
        })
    for(let i=0; i<newArray.length; i++) {
        newArray[i]['order'] = seq[i]
    }
    return newArray
}

function showCard(array) {
    array.forEach(obj => {
        obj = addLetal(obj)
        if (obj.order !== 'global') { // pois Global nao tem o nome na base
            card = document.getElementById(obj.order)
            card.textContent = obj.Country
        }
        
        card = document.getElementById(obj.order + 'casos')
        card.className += "float-right";
        card.textContent = obj.TotalConfirmed.toLocaleString()
        card = document.getElementById(obj.order + 'mortes')
        card.className += "float-right";
        card.textContent = obj.TotalDeaths.toLocaleString()
        card = document.getElementById(obj.order + 'letal')
        card.className += "float-right";
        card.textContent = obj.letal
    })
}

async function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
// handle with steps to lazy load data 
async function dadosGrafico(data) {
    let array, time = 150, slug, saida = []
    for (let l = 0; l < data.length; l ++) {
        slug = data[l].Slug;
        await delay(time); // carregar dados com espaco de tempo 
        array = await fetchApi(baseUrl+slug);
        saida.push(array)
        array = []
    }
    return(saida)
}


 

///   ----  ACTIVITY FUNCTIONS   ----

function fullPlot(countryArray) {
    //console.log(data)
    let dia, mes, plotData = [], eixoX = 'Data' // Data ou Dia
    // load the graph traces
    for (let i = 0; i < countryArray.length; i++) { 
        // i indice do array de informacoes de cada pais
        plotData.push(prepTrace(countryArray[i], eixoX, i))
    }
    let datainicio = new Date(plotData[0].x[0]) // data de inicio do gráfico
    dia = datainicio.getDate()+1
    mes = mesDoAno[datainicio.getMonth()]
    Plotly.newPlot(document.getElementById('tester1'), 
        plotData, 
        { title: `Casos de COVID-19 nos Países destacados, desde o dia ${dia} de ${mes}` }
    );
}

/// handle plots
function comparedPlot(data) {
    let layout, dias, dadosG = []
    for (let i = 0; i < data.length; i++) {
        dadosG.push(prepTrace(data[i], 'Dia', i))
    }
    dadosG = sameSizeTrace(dadosG);  // correcao para pais com menos dias de pandemia
    dias = dadosG[0].x.length
    layout = {
        title: `Dados a partir de ${iniciocontagem} Casos dos primeiros ${dias} dias de Pandemia nos Países destacados`,
        annotations: [
          {
            xref: 'paper', yref: 'paper', x: 50, y: -10, xanchor: 'center', yanchor: 'top',
            text: 'Source: World Metter, JHU', showarrow: false,
            font: {family: 'Arial', size: 12, color: 'rgb(150,150,150)'}
          }
        ]
      };
    Plotly.newPlot(document.getElementById('tester2'), dadosG, layout);
}

// Grafico de casos diarios
function dailyPlot(data) {
    data.forEach(obj => {
        obj.casosarray = toDaily(obj.casosarray)
    })  // dados vem acumulados, passar para dados diarios

    let newArray = []
    data.forEach((obj,index) => {
        newArray.push( prepTrace(obj.casosarray, 'Dia', index, obj.pais) )
    })
    console.log(newArray)
    // edit layout
    var layout = {
        title: ` Casos diários da Pandemia de COVID-19 no Brasil a partir de 1000 casos confirmados`,
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
    Plotly.newPlot(document.getElementById('tester3'), newArray, layout);
}



/// Funcao principal
async function main() {
    let response, data, graficoData = [], CardsInfo = []

    // GET the list of basic, daily, light Country data
    response = await fetchApi(summaryUrl)

    // filtrar top 7 em casos e aribuir ordem
    let CountriesInfo = topCasos(response.Countries,n = countryCards)
    CardsInfo.push(...CountriesInfo)
    
    // add global
    response.Global['order'] = 'global'
    CardsInfo.push(response.Global)
    
    //showCard() printar card
    showCard(CardsInfo) // global + 7 paises com mais casos
    
    // Carregar dados do grafico de forma lenta
    data = await dadosGrafico(CountriesInfo) 
    
    /// 4 Graficos: 
    // Casos acumulados nos 7 paises por data
    
    fullPlot(data) 
    // Country, Confirmed, Date

    // Casos acumulados nos 7 paises a partir de 1000 casos acumulados
    comparedPlot(data)

    // Casos diarios nos 7 paises por data
    // Mortes diarias nos 7 paises por data

}
 
// chamada de funcoes ao iniciar
function eventos() {
    tmp = setTimeout(main, 100);
};

window.addEventListener("load", eventos);


/*
    // dados diarios
    for (var i=0; i < dailyCountries.length; i++) {
        response =  await fetchApi(daily+dailyCountries[i])
        data.push(response)
    }
    
    // filterData
    data = filterdaily(data,['Confirmed'],iniciocontagem)
   // tmp5 = dailyPlot(data);

*/

/* comentado  
    let readData, gData = []
    for(r in seq) { // r = 0 e seq[r] = primeiro
        let {Slug} = data[r]
    // load data
        readData = await fetchApi('https://api.covid19api.com/country/'+Slug)
    // clean and fill graphData     
        await setTimeout( () => {
            gData.push(
                {
                'order' : seq[r],
                'data': clean(readData)
                }
            )
        }, 100);

    }
    console.log(gData);
    return(gData)

async function f2(data) {  
    let gData = []
    //console.log(data)
    for(r in seq) { // r = 0 e seq[r] = primeiro
        let [{Slug}] = data
    // load data
    
        readData = 
    // reduzir o tamanho de data
    //console.log(readData);
        /
    
    // delay then over and over
    setTimeout(150)
    }

} 


    // load data
    // filter data size
    // fill finalObj
    // delay then over and over

    // loop para todos os paises

     // load data slowly 
     CountriesInfo.forEach(obj => {
        if(obj.order !== 'global') {
            setTimeout(
                data = await fetchApi(baseUrl+obj.Slug)
            ,150)

            // reduzir o tamanho de data
            data = pocketSize(data)
            graficoData.push(
                {
                    'order' : obj.order,
                    'data': data
                }
            )

            data = []
        }
    })

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
            console.log(response)
            for (let k = 0; k < response.length - 1; k++) {
                obj = response[k]
                trace.push({ 'Data': obj.Date, 'Casos': obj.Confirmed, 'Mortos': obj.Deaths })
            }
            thisCountry['info'] = trace
            thisCountry['name'] = response[0]['Country']
        }
       // graficoData.push(thisCountry)
    }
    //graficoData.shift()
        //console.log(graficoData)
    //tmp3 = f3(graficoData)
    //tmp4 = f4(data) 
*/

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