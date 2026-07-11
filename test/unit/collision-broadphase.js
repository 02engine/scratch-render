const tap = require('tap');

const RenderWebGL = require('../../src/RenderWebGL');
const Rectangle = require('../../src/Rectangle');

const rectangle = (left, right, bottom, top) => {
    const result = new Rectangle();
    result.initFromBounds(left, right, bottom, top);
    return result;
};

const drawable = bounds => ({
    skin: {},
    _visible: true,
    updateCPURenderAttributes () {},
    getAABB () {
        return rectangle(...bounds);
    },
    getFastBounds () {
        return rectangle(...bounds);
    }
});

tap.test('collision broad phase preserves candidate order and exact intersections', t => {
    const renderer = Object.create(RenderWebGL.prototype);
    renderer._collisionCellSize = 64;
    renderer._collisionCells = new Map();
    renderer._collisionDrawableCells = [];
    renderer._collisionOverflow = new Set();
    renderer._collisionDirty = new Set();
    renderer._candidateOrderCache = new WeakMap();
    renderer._allDrawables = [];
    renderer._drawList = [];
    renderer.allowPrivateSkinAccess = true;

    renderer._allDrawables[1] = drawable([0, 10, 0, 10]);
    renderer._drawList.push(1);
    renderer._collisionDirty.add(1);
    for (let id = 2; id <= 100; id++) {
        const bounds = id === 75 ? [5, 15, 5, 15] : [id * 100, (id * 100) + 10, 1000, 1010];
        renderer._allDrawables[id] = drawable(bounds);
        renderer._drawList.push(id);
        renderer._collisionDirty.add(id);
    }
    renderer._touchingBounds = () => rectangle(0, 10, 0, 10);

    const candidates = renderer._candidatesTouching(1, renderer._drawList);
    t.same(candidates.map(candidate => candidate.id), [75]);
    t.ok(renderer._candidateOrderCache.has(renderer._drawList));
    t.end();
});
