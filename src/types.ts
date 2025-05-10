
export interface JoinParams {
    name : string | null;  
    spaceId : string | null; 
    avatarUrl : string | null; 
}

export type User = {
    _id: string,
    username : string, 
    spaces : string[], 
    description : string, 
    image : string 
}

