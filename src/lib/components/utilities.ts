export const checkPermission = (subscription: any, uid: any, permissions: any) => {
    let allow = false;
    for(let i=0; i<permissions.length; i++){
        if(subscription?.permissions && subscription?.permissions[permissions[i]]){
            if(subscription?.permissions[permissions[i]].indexOf(uid) >= 0){
                allow = true;
            }
        }
    }
    if(subscription?.ownerId === uid){
        allow = true;
    }
    return allow;
}
