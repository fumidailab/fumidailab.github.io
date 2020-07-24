/**
 * @author mrdoob / http://mrdoob.com/
 */



function CannonPhysics() {

	var frameRate = 60;
	var frameTime = 1 / frameRate;

	var world = new CANNON.World();
	world.gravity.set( 0, - 9.8, 0 );
	world.broadphase = new CANNON.SAPBroadphase( world );
	// world.solver.iterations = 20;
	// world.solver.tolerance = 0.001;
	// world.allowSleep = true;

	//

	function getShape( geometry ) {

		var parameters = geometry.parameters;

		// TODO change type to is*

		switch ( geometry.type ) {

			case 'BoxBufferGeometry':
				var halfExtents = new CANNON.Vec3();
				halfExtents.x = parameters.width !== undefined ? parameters.width / 2 : 0.5;
				halfExtents.y = parameters.height !== undefined ? parameters.height / 2 : 0.5;
				halfExtents.z = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
				return new CANNON.Box( halfExtents );

			case 'PlaneBufferGeometry':
				return new CANNON.Plane();

			case 'SphereBufferGeometry':
				var radius = parameters.radius;
				return new CANNON.Sphere( radius );

		}

		return null;

	}

	var meshes = [];
	var meshMap = new WeakMap();

	function addMesh( mesh, shape, mass, mat = null, groupNo=-1 ) {

		var body = null;
		if( shape == null ) {
			shape = getShape( mesh.geometry );
		}

		if ( shape !== null ) {

			var position = new CANNON.Vec3();
			var quaternion = new CANNON.Quaternion();

			if(mesh != null) {
				position.copy( mesh.position );
				quaternion.copy( mesh.quaternion );
			}

			body = new CANNON.Body( {
				position: position,
				quaternion: quaternion,
				mass: mass,
				shape: shape,
				material: mat,
				collisionFilterGroup:groupNo,
				collisionFilterMask:groupNo,
			} );
			world.addBody( body );

			if ( mass > 0 && mesh != null ) {

				meshes.push( mesh );
				meshMap.set( mesh, body );

			}

		}
		return body;

	}

	//

	function setMeshPosition( mesh, position ) {

		if ( mesh.isMesh ) {

			var body = meshMap.get( mesh );
			body.position.copy( position );

		}

	}

	//

	function update( delta ) {

		var time = performance.now();

		// console.time( 'world.step' );
		world.step( frameTime, delta, frameRate );
		// console.timeEnd( 'world.step' );

		//

		for ( var i = 0, l = meshes.length; i < l; i ++ ) {

			var mesh = meshes[ i ];

			if ( mesh.isMesh ) {

				var body = meshMap.get( mesh );
				mesh.position.copy( body.position );
				mesh.quaternion.copy( body.quaternion );

			}

		}

	}

	function getBody(mesh) {
		if ( mesh.isMesh ) {
			return meshMap.get( mesh );
		}
		return null;
	}

	return {
		world: world,
		update: update,
		addMesh: addMesh,
		setMeshPosition: setMeshPosition,
		getBody: getBody,
	};

}

export { CannonPhysics };
