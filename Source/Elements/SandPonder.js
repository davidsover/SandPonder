SpaceTode`

element Sand2D {
	colour "#ffcc00"
	emissive "#000000"
	category "SandPonder"
	prop state SOLID
	prop temperature ROOM
	
	rule {
		@ => _
		_    @
		
		@ => _
		$    $
	}
	
	default true
}

element Sand2D2 {
	colour "#00ccff"
	emissive "#000000"
	category "SandPonder"
	prop state SOLID
	prop temperature ROOM
	
	mimic(Sand2D)
}


element Fill2D {
	colour "#772277"
	emissive "#000000"
	category "SandPonder"
	prop state SOLID
	prop temperature ROOM
	
	
	given a (element) => (element !== Fill2D && element !== Fill2DOff && element !== Empty)
	change a (atom) => atom
	
	given o (element) => (element === Fill2DOff)
	change o () => new Fill2DOff()
	
	rule {
		for(xz) {
			@_ => @$
			aa    aa
		}
		
		for(xz) {
			@ => o
			a    a
		}
	}
	
	rule {
		@ => _
		_    @
		
		@ => _
		$    $
		
		@ => _
		o    o
	}
}


element Fill2D2 {
	colour "#227777"
	emissive "#000000"
	category "SandPonder"
	prop state SOLID
	prop temperature ROOM
	
	
	given a (element) => (element !== Fill2D2 && element !== Fill2D2Off && element !== Empty)
	change a (atom) => atom
	
	given o (element) => (element === Fill2D2Off)
	change o () => new Fill2D2Off()
	
	
	rule {
		for(xz) {
			@_ => @$
			aa    aa
		}
		
		for(xz) {
			@ => o
			a    a
		}
	}
	
	rule {
		@ => _
		_    @
		
		@ => _
		$    $
		
		@ => _
		o    o
	}
}


element Fill2DOff {
	colour "#77FF77"
	emissive "#000000"
	category "SandPonder"
	prop state SOLID
	prop temperature ROOM
}

element Fill2D2Off {
	colour "#FF7777"
	emissive "#000000"
	category "SandPonder"
	prop state SOLID
	prop temperature ROOM
}

`