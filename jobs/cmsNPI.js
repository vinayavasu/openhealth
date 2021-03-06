console.log('cmsNPI.js loaded')

// https://npiregistry.cms.hhs.gov/registry/help-api

openHealth.cmsNPI=function(npi,fun){
    //var id="fun"+Math.random().toString().slice(2)
    this.cmsNPI['npi'+npi]=function(x){
        x = openHealth.flatJSON(x)
        fun(x)
    }
    window["openHealth_cmsNPI_npi"+npi]=function(x){
        openHealth.cmsNPI["npi"+npi](x)
    }
    $.getScript("https://script.google.com/macros/s/AKfycbzSZ_qOQObCjnV2---pYr6xl2vuoikkbRCPrt96biA_YZbk9HVn/exec?number="+npi+"&callback=openHealth_cmsNPI_npi"+npi)
}

// Assemble UI 
openHealthJob.innerHTML='paste/type NPIs:<br><textarea style="width:100%;height:50%" id="npiInputTextArea"></textarea><br><button id="retrieveNpiData">Retrieve NPI data</button> <button id="resetLocalStorage">resetCache</button>'
resetLocalStorage.onclick=function(){
    localStorage.clear()
    this.hidden=true
}
retrieveNpiData.onclick=function(){
    var npis = npiInputTextArea.value
    npis=npis.replace(/\D+/g,',')
    if(npis.slice(0,1)==','){npis='['+npis.slice(1)}else{npis='['+npis}
    if(npis.slice(-1)==','){npis=npis.slice(0,-1)+']'}else{npis=npis+']'}
    npis=JSON.parse(npis)
    openHealthJob.innerHTML='Retrieving data from <a href="https://npiregistry.cms.hhs.gov" target="_blank">CMS</a><br><span style="color:red">retrieving data on '+npis.length+' NPIs...</span>'
    var docs=[]
    gotNPIs=function(docs){
        console.log('retrieved '+docs.length+' reccords')
        openHealthJob.innerHTML='Retrieved '+docs.length+' reccords from <a href="https://npiregistry.cms.hhs.gov/registry/help-api" target="_blank">https://npiregistry.cms.hhs.gov</a> (Thank you!)<br><div id="divNPIs">Add Column <select id="addField"></select><hr><div id="npiTable"></div></div>'
        d=docs
        // list fields
        var flds={}
        docs.map(function(d){
            Object.getOwnPropertyNames(d).map(function(f){
                flds[f]=true
            })
        })
        flds=Object.getOwnPropertyNames(flds)
        var tbl=document.createElement('table')
        tbl.style.border="1px solid navy"
        npiTable.appendChild(tbl)
        var tbdy=document.createElement('tbody')
        var tbhd=document.createElement('thead')
        tbl.appendChild(tbhd)
        tbl.appendChild(tbdy)
        var trtd=function(t,id,txt){
            var el = document.createElement(t)
            if(id){el.id=id}
            if(txt){el.textContent=txt}
            return el
        }
        var tr=function(id,txt){return trtd('tr',id,txt)}
        var td=function(id,txt){return trtd('td',id,txt)}
        // head
        var headTr=tr();tbhd.appendChild(headTr)
        var tdh=td("npi_head","NPI")
        tdh.style.color="maroon"
        tdh.style.border="1px solid maroon"
        if(tdh.textContent!=="NPI"){
            tdh.style.cursor="pointer"
        }
        headTr.appendChild(tdh)
        var trs=[] // keeping rows in a matrix
        for(var i=0;i<npis.length;i++){
            trs[i]=tr('tr_'+i)
            var tdi=td('td_'+1+'_'+i,npis[i])
            tdi.style.padding=5
            tdi.style.color="blue"
            tdi.style.border="1px solid blue"
            trs[i].appendChild(tdi)
            tbdy.appendChild(trs[i])
        }
        // Add options to select

        flds = (['Select a field below:'].concat(flds.sort()))
        flds.forEach(function(f,i){
            var op = document.createElement('option')
            op.value=i;op.textContent=flds[i]
            addField.appendChild(op)
        })
        addField.onchange=function(s,z){
            //addColumn(s.srcElement.selectedOptions[0].textContent)
            addColumn(this.options[this.value].textContent)
        }
        var addColumn=function(c){
            if(c!="Select a field below:"){
                console.log('column "'+c+'" added to table')
                var tdc=td(c+'_head',c)
                tdc.style.padding=5
                tdc.style.color="maroon"
                tdc.style.border="1px solid maroon"
                tdc.onclick=function(){
                    for(var i=0;i<trs.length;i++){
                        var x = document.getElementById(c+'_'+i)
                        x.parentElement.removeChild(x)
                    }
                    var x = document.getElementById(c+'_head')
                    x.parentElement.removeChild(x)
                }
                headTr.appendChild(tdc)
                trs.forEach(function(t,i){
                    var tdi=td(c+'_'+i,docs[i][c])
                    tdi.style.padding=5
                    tdi.style.color="blue"
                    tdi.style.border="1px solid blue"
                    t.appendChild(tdi)
                })
            }   
        }
    }
    var getNPI = function (i,fun){
        if(localStorage.getItem('npi'+npis[i])){
           docs[i]=JSON.parse(localStorage.getItem('npi'+npis[i]))
           console.log('got npi '+npis[i]+' from localStorage')
           if(i<npis.length-1){getNPI(i+1,fun)}else{gotNPIs(docs)}
        }else{
            openHealth.cmsNPI(npis[i],function(x){
                x.status='found'
                docs[i]=x
                console.log('got npi '+npis[i]+' from cmsNPI')
                localStorage.setItem('npi'+npis[i],JSON.stringify(x))
                fun(i)
                if(i<npis.length-1){getNPI(i+1,fun)}else{gotNPIs(docs)}         
            })
        }
        setTimeout(function(){
            if(!docs[i]){
                docs[i]={status:'not found'}
                //localStorage.setItem('npi'+npis[i],JSON.stringify(docs[i]))
                if(i<npis.length-1){getNPI(i+1,fun)}else{gotNPIs(docs)}
            }
        },2000) 
    }
    getNPI(0,function(i){
        openHealthJob.innerHTML='Retrieving data from <a href="https://npiregistry.cms.hhs.gov/registry/help-api" target="_blank">https://npiregistry.cms.hhs.gov</a> (Thank you!)<br><span style="color:red">retrieving data on '+(i+1)+' out of a total of '+npis.length+' NPIs...</span>'
    })
    

}
