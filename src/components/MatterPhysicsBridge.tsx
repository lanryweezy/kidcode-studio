import React from 'react';

const MatterPhysicsBridge = React.lazy(() =>
    import('./MatterPhysicsBridgeInner').then(m => ({ default: m.MatterPhysicsBridgeInner }))
);

export default MatterPhysicsBridge;
