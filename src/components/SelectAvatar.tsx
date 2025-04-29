import React from "react";

// Available avatar spritesheets // 
const avatarOptions  = [
    {id : 1, url: "images/avatars/dude1.png"},     
]; 


interface AvatarProps {
    onSelect : (selection : number) => void; 
}


export const SelectAvatar : React.FC<AvatarProps> = ({onSelect}) => { 
    
    const handleSelect = (id:number) => {
        // Not being used for anything currently (can later display the avatar's name) //   
        onSelect(id); 
    } 
    
    return (

        <div className="avatarDisplay"> 

            <div className="avatar-grid">

            {avatarOptions.map((avatar) => {

                // Avatar image preview // 
                return (
                    <div key={avatar.id} className="avatarOption" onClick={() => handleSelect(avatar.id)}> 
                        <img src={avatar.url} alt={`Avatar ${avatar.id}`} />   
                    </div> 
                )

            })}

            </div>
            

        </div>

    )


}