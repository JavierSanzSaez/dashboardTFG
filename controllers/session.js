const maxIdleTime = 5*60*1000;

exports.checkSession = (req,res,next)=>{
    let requestedUrl = '';
    deleteExpiredUserSession(req,res);
    if(!req.session.dockerDestino){
        res.render('index',{session:false});
        res.end()
    }

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
  if(req.sessionOptions.maxAge < Date.now()){
    req.session = null;
    res.render('index');
    res.end();
  }
  else{
      req.sessionOptions.maxAge = Date.now()+maxIdleTime;
  }
}