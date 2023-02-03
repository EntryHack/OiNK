"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = __importDefault(require("@/utils/graphql"));
console.log("Hello, world!");
(0, graphql_1.default)(`
query RCOMMEND_USER ($minCount: Int, $limit: Int) {
    recommendUser(minCount: $minCount, limit: $limit) {
        total
        list {
            id
            nickname
            username
            profileImage {
                
id
name
label {
    
ko
en
ja
vn

}
filename
imageType
dimension {
    
width
height

}
trimmed {
    filename
    width
    height
}

            }
            coverImage {
                
id
name
label {
    
ko
en
ja
vn

}
filename
imageType
dimension {
    
width
height

}
trimmed {
    filename
    width
    height
}

            }
        }
    }
recommendUser(minCount: $minCount, limit: $limit) {
        total
        list {
            id
            nickname
            username
            profileImage {
                
id
name
label {
    
ko
en
ja
vn

}
filename
imageType
dimension {
    
width
height

}
trimmed {
    filename
    width
    height
}

            }
            coverImage {
                
id
name
label {
    
ko
en
ja
vn

}
filename
imageType
dimension {
    
width
height

}
trimmed {
    filename
    width
    height
}

            }
        }
    }
}
`, {}, {}).then(console.log);
