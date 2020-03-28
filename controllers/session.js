const maxIdleTime = 5*60*1000;

exports.checkSession = (req,res,next)=>{

    deleteExpiredUserSession(req,res);

    if(!req.session.dockerDestino){
        req.session = null;
        res.render('index', {sesion : false});
        res.end()
    }

    let requestedUrl = '';
    if(req.url==='/graphfes' || req.url==='/mwdex'){
        requestedUrl = req.url;
    }else{requestedUrl='no change'}

    switch (requestedUrl) {
        case ('/graphfes'):
            req.session.dockerDestino='graphfes';
            req.url ='/';
            break;
        case ('/mwdex'):
            req.session.dockerDestino='mwdex';
            req.url ='/';
            break;
        default:
            break;
    }

    next();
};

function deleteExpiredUserSession (req,res){
  if(req.session.maxAge < Date.now()){
    req.session = null;
    res.render('index',{sesion : false});
    res.end();
  }
  else{
      req.session.maxAge = Date.now()+maxIdleTime;
  }
}