/**
 * @author mrdoob / http://mrdoob.com/
 */



function CannonPhysics() {

	var frameRate = 60;
	var frameTime = 1 / frameRate;

	var world = new CANNON.World();
	world.gravity.set( 0, - 9.8, 0 );
	world.broadphase = new CANNON.SAPBroadphase( world );

	function createBody( shape, mass, mat, group, mask ) {

		let body = new CANNON.Body( {
			position: new CANNON.Vec3(),
			quaternion: new CANNON.Quaternion(),
			mass: mass,
			shape: shape,
			material: mat,
			collisionFilterGroup:group,
			collisionFilterMask :mask,
		} );
		return body;

	}
	function addBody( shape, mass, mat, group, mask ) {

		let body = createBody( shape, mass, mat, group, mask );
		world.addBody( body );
		return body;

	}
	function removeBody( body ) {
		world.removeBody( body );
	}

	function update( delta ) {

		//var time = performance.now();

		// console.time( 'world.step' );
		world.step( frameTime, delta, frameRate );
		// console.timeEnd( 'world.step' );

	}

	return {
		world: world,
		update: update,
		createBody: createBody,
		addBody: addBody,
		removeBody: removeBody,
	};

}

export { CannonPhysics };
