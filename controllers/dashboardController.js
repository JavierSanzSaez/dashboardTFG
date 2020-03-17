const axios = require('axios');
const fs = require('fs');
const path = require('path');

var dockerDestino = 'localhost';

exports.axiosConnection= (req, res, next) =>{
    console.log('req.url:'+ req.url);  //Test
    var requestedUrl = '';
    var directorioDestino = req.url;
    //De req.path obtiene el directorio inicial (graphfes/mwdex/test/etc) y lo almacena en la variable requestedUrl.
    if(req.url=='/graphfes' || req.url=='/mwdex'){
        requestedUrl = ''+req.url;
    }else{requestedUrl='no change'}
    console.log('requestedUrl: '+requestedUrl); //Test
    switch (requestedUrl) {
        case(''):
            dockerDestino='localhost';
            directorioDestino ='/';
            break;
        case ('/graphfes'):
            dockerDestino='graphfes';
            directorioDestino ='/';
            break;
        case ('/mwdex'):
            dockerDestino='mwdex';
            directorioDestino ='/';
            break;
            //En el caso en el que no se haga ninguna llamada de inicio a uno de los servidores, dockerDestino se mantendrá en su valor.
        default: break;
    }
    console.log('dockerDestino: '+dockerDestino);  //Test
    console.log('Mandando petición a: '+dockerDestino +':3000'+directorioDestino + ' con método ' + req.method);

    //Petición GET via Axios al contenedor de Docker con nombre destination
    if(req.method==='GET') {
        axios.get('http://' + dockerDestino + ':3000' + directorioDestino)
            .then(function (response) {
                console.log("HTTP Response header: "+response.headers['content-type']);
                //Se renderiza el fichero local respuesta con la respuesta HMTL del servidor bajo el parámetro body

                if ((response.headers['content-type']==="text/html; charset=utf-8")||(response.headers['content-type'==='application/javascript'])) {
                    //Renderiza HTML y Javascript sin problemas
                    res.render('result', {body: response.data});
                }
                else{
                    /*Como no es HTML, para evitar fallos no se renderiza el fichero recibido, sino que se guarda el fichero.
                        Luego otra ruta se encargará de llamarlo/renderizarlo.
                    */
                    fs.writeFileSync(path.join(__dirname,'/graphs/tempgraph.gexf'),response.data);
                    console.log("Fichero escrito y alojado");
                    /*Comprobación de que el fichero ha sido escrito correctamente */
                    fs.readFile(path.join(__dirname,'/graphs/tempgraph.gexf'), function read(err, data) {
                        if (err) {
                            throw err;
                        }
                        const content = data;
                        console.log(content);
                    });
                    res.sendFile(path.join(__dirname,'/graphs/tempgraph.gexf'));

                }
            })
            .catch(function (error) {
                console.log(error);
                res.render('result', {body: error});
            });
    }
    else if (req.method==='POST'){
        axios.post('http://' + dockerDestino + ':3000' + directorioDestino, req.body)
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
