import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Server', 'Edge Server', 'Edge', 'Parts'], 
    required: true
  },
  sku: { 
    type: String, 
    required: true 
  },
  pn: { 
    type: String, 
    required: true 
  },
  family: { 
    type: String, 
    required: true 
  },
  imgUrl: { 
    type: String 
  },
  familyImgUrl: { 
    type: String 
  },
  processor: { 
    type: String 
  },
  platform: { 
    type: String
  },
  tops: { 
    type: Number 
  },
  ai_accelerator: { 
    type: String 
  },
  memory: { 
    type: String
  },
  storage: { 
    type: String 
  },
  os: { 
    type: String 
  },
  wireless: { 
    type: String 
  },
  bluetooth: { 
    type: String 
  },
  I_O: { 
    type: String 
  },
  button: { 
    type: String 
  },
  ethernet: { 
    type: String 
  },
  hdmi: { 
    type: String 
  },
  power: { 
    type: String 
  },
  cooling_fan: { 
    type: String 
  },
  operating_temperature: { 
    type: String 
  },
  mechanical_dimension: { 
    type: String 
  },
  weight: { 
    type: String 
  },
  di_do: { 
    type: String 
  },
  display: { 
    type: String 
  },
  audio: { 
    type: String 
  },
  camera: { 
    type: String 
  },
  battery: { 
    type: String 
  },
  certification: { 
    type: String 
  },
  tag: { 
    type: String 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['enable', 'disable'],
    default: 'enable'
  },
  downloadUrl: { 
    type: String 
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
