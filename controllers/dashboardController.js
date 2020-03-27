const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Excel = require('exceljs/modern.nodejs');
const jsonfile = require('jsonfile');

exports.axiosConnection= (req, res) =>{
    //Petición GET via Axios al contenedor de Docker con nombre destination
    if(req.method==='GET') {
        //Coger el "Excel" para pedir un JSON y después construirlo en local
        var check = "json";
        if (getFormCheck(req.url)==='check=excel'){check = "excel"}else{check = "json"}

        axios.get('http://' + req.session.dockerDestino + ':3000' + req.url)
            .then(function (response) {
                console.log("HTTP Response header: "+response.headers['content-type']);
                //Se renderiza el fichero local respuesta con la respuesta HMTL del servidor bajo el parámetro body

                if ((response.headers['content-type']==="text/html; charset=utf-8")||(response.headers['content-type'==='application/javascript'])) {
                    //Renderiza HTML y Javascript sin problemas
                    res.render('result', {body: response.data});
                }
                else if(response.headers['content-type']==="application/json; charset=utf-8"){
                    let ts = Date.now();
                    let date_ob = new Date(ts);
                    let date = ("0" + date_ob.getDate()).slice(-2);
                    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                    let year = date_ob.getFullYear();
                    let hours = ("0" + date_ob.getHours()).slice(-2);
                    let minutes = ("0" + date_ob.getMinutes()).slice(-2);
                    let seconds = ("0" + date_ob.getSeconds()).slice(-2);

                    if(check==="json"){
                        console.log(check);
                        let downloadfilejson = 'MWDEX_download_' + year + "_" + month + "_" + date + "_" + hours + "_" + minutes + "_" + seconds + '.json';
                        const jsonDataArray = response.data;
                        jsonfile.writeFile(downloadfilejson, jsonDataArray, function (err) {
                        if (err) console.error(err);
                        res.header("Content-Type",'application/json');
                        res.send(jsonDataArray);
                    })}
                    else if(check=== "excel"){
                        let filename = 'MWDEX_download_' + year + "_" + month + "_" + date + "_" + hours + "_" + minutes + "_" + seconds + '.xlsx';

                        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                        res.setHeader("Content-Disposition", "attachment; filename=" + filename);

                        var workbook = new Excel.Workbook();
                        var worksheet = workbook.addWorksheet('Notas');
                        worksheet.columns = [
                            {header: 'Reviewed', width: 50
                            },
                            {header: 'Reviewer', width: 50
                            },
                            {header: 'Final Grade', width: 10
                            },
                            {header: 'Final Grade Aspects', width: 10
                            },
                            {header: 'Feedback Final', width: 50
                            },
                            {header: 'Grade Aspect 1', width: 10
                            },
                            {header: 'Feedback Aspect 1', width: 50
                            },
                            {header: 'Grade Aspect 2', width: 10
                            },
                            {header: 'Feedback Aspect 2', width: 50
                            },
                            {header: 'Grade Aspect 3', width: 10
                            },
                            {header: 'Feedback Aspect 3', width: 50
                            },
                            {header: 'Self', width: 10
                            },
                        ];

                        for (var i = 0; i < response.data.length; i++) {
                            var elem = response.data[i];
                            worksheet.addRow([elem.Submitter, elem.Reviewer, elem.AvgTotalGrade, elem.ReviewerTotalGrade, elem.GlobalFeedback, elem.Rubric1Grade, elem.Rubric1Feedback, elem.Rubric2Grade, elem.Rubric2Feedback, elem.Rubric3Grade, elem.Rubric3Feedback, elem.SelfAssessment]);
                        }

                        try{
                            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                            res.setHeader("Content-Disposition", "attachment; filename=" + filename);
                            workbook.xlsx.write(res).then(function(){
                                res.end();
                            });
                        }catch (error){
                            console.log(error);
                        }
                    }
                }
                else{
                    /*Como no es HTML, para evitar fallos no se renderiza el fichero recibido, sino que se guarda el fichero.
                        Luego otra ruta se encargará de llamarlo/renderizarlo.
                    */
                    if(req.session.dockerDestino==="graphfes") {
                        fs.writeFileSync(path.join(__dirname, '/graphs/tempgraph.gexf'), response.data);
                        console.log("Fichero escrito y alojado");
                        /*Comprobación de que el fichero ha sido escrito correctamente */
                        fs.readFile(path.join(__dirname, '/graphs/tempgraph.gexf'), function read(err, data) {
                            if (err) {
                                throw err;
                            }
                            const content = data;
                            console.log(content);
                        });
                        res.sendFile(path.join(__dirname, '/graphs/tempgraph.gexf'));
                    }
                    else if(req.session.dockerDestino==="mwdex"){
                        let ts = Date.now();
                        let date_ob = new Date(ts);
                        let date = ("0" + date_ob.getDate()).slice(-2);
                        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                        let year = date_ob.getFullYear();
                        let hours = ("0" + date_ob.getHours()).slice(-2);
                        let minutes = ("0" + date_ob.getMinutes()).slice(-2);
                        let seconds = ("0" + date_ob.getSeconds()).slice(-2);
                        let filename = 'MWDEX_download_' + year + "_" + month + "_" + date + "_" + hours + "_" + minutes + "_" + seconds + '.xlsx';

                        fs.writeFile(path.join(__dirname, '/mwdex/tempfile.xlsx'), response.data,function (err){
                           console.log(err);
                        });

                            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                            res.setHeader("Content-Disposition", "attachment; filename=" + filename);
                            res.sendFile(path.join(__dirname, '/mwdex/tempfile.xlsx'))
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
                res.render('result', {body: error});
            });
    }
    else if (req.method==='POST'){
        axios.post('http://' + req.session.dockerDestino + ':3000' + req.url, req.body)
        .then(function (response) {
        //Se renderiza el fichero local respuesta con la respuesta HMTL del servidor bajo el parámetro body
        res.render('result', {body: response.data});
        })
        .catch(function (error) {
            console.log(error);
            res.render('result', {body: error});
        });
    }
    //No incluyo los headers de API REST (DELETE, PUT...) porque los módulos no lo necesitan. Si se necesitasen se añaden.
};

function getFormCheck(url) {
    var check = url.substr(url.indexOf('check='),url.length);
    return check
}