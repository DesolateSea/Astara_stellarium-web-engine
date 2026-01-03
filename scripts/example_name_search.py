"""
Example: Using the name index for autocomplete/query suggestions
"""

import json
from pathlib import Path

class SkyObjectSearch:
    """Simple search engine for sky objects using the name index"""
    
    def __init__(self, index_dir='name_index'):
        """Load the name index"""
        self.index_dir = Path(index_dir)
        
        # Load compact index for fast autocomplete
        compact_file = self.index_dir / 'name_index_compact.json'
        with open(compact_file, 'r', encoding='utf-8') as f:
            self.compact_index = json.load(f)
        
        # Load full index for detailed lookups
        full_file = self.index_dir / 'name_index.json'
        with open(full_file, 'r', encoding='utf-8') as f:
            full_index = json.load(f)
        
        # Create lookup dictionary (name -> object data)
        self.lookup = {item['name'].lower(): item for item in full_index}
        
        print(f"✓ Loaded {len(self.lookup)} sky objects")
        print(f"  - Stars: {len(self.compact_index['stars'])}")
        print(f"  - DSOs: {len(self.compact_index['dsos'])}")
    
    def suggest_names(self, query, limit=10, object_type=None):
        """
        Get name suggestions for autocomplete
        
        Args:
            query: Search query string
            limit: Maximum number of suggestions
            object_type: Filter by type ('star', 'dso', or None for all)
        
        Returns:
            List of matching names
        """
        query_lower = query.lower()
        
        # Choose which list to search
        if object_type == 'star':
            search_list = self.compact_index['stars']
        elif object_type == 'dso':
            search_list = self.compact_index['dsos']
        else:
            search_list = self.compact_index['all']
        
        # Find matches (case-insensitive substring search)
        matches = []
        for name in search_list:
            if query_lower in name.lower():
                matches.append(name)
                if len(matches) >= limit:
                    break
        
        return matches
    
    def get_object_info(self, name):
        """
        Get detailed information about a sky object
        
        Args:
            name: Object name
        
        Returns:
            Dictionary with object data, or None if not found
        """
        return self.lookup.get(name.lower())
    
    def search_by_prefix(self, prefix, limit=10):
        """
        Search for objects starting with a prefix (useful for catalog searches)
        
        Args:
            prefix: Prefix to search for (e.g., "M ", "NGC ", "HIP ")
            limit: Maximum number of results
        
        Returns:
            List of matching names
        """
        prefix_lower = prefix.lower()
        matches = []
        
        for name in self.compact_index['all']:
            if name.lower().startswith(prefix_lower):
                matches.append(name)
                if len(matches) >= limit:
                    break
        
        return matches
    
    def format_object_info(self, obj):
        """Format object information for display"""
        if not obj:
            return "Object not found"
        
        lines = []
        lines.append(f"Name: {obj['name']}")
        lines.append(f"Type: {obj['type'].upper()}")
        
        if obj['type'] == 'star':
            if obj.get('hip'):
                lines.append(f"HIP: {obj['hip']}")
            if obj.get('hd'):
                lines.append(f"HD: {obj['hd']}")
        elif obj['type'] == 'dso':
            if obj.get('dso_type'):
                lines.append(f"DSO Type: {obj['dso_type']}")
        
        if obj.get('vmag') is not None:
            lines.append(f"Magnitude: {obj['vmag']:.2f}")
        
        if obj.get('ra') is not None and obj.get('de') is not None:
            lines.append(f"RA: {obj['ra']:.4f}°")
            lines.append(f"Dec: {obj['de']:.4f}°")
        
        if obj.get('primary_name') and obj['primary_name'] != obj['name']:
            lines.append(f"Also known as: {obj['primary_name']}")
        
        return '\n'.join(lines)


def demo():
    """Demonstrate the search functionality"""
    print("Sky Object Search Demo")
    print("=" * 80)
    print()
    
    # Initialize search engine
    search = SkyObjectSearch()
    print()
    
    # Example 1: Autocomplete suggestions
    print("=" * 80)
    print("Example 1: Autocomplete suggestions")
    print("-" * 80)
    queries = ["sir", "m3", "hip 1", "betel", "androm"]
    for query in queries:
        suggestions = search.suggest_names(query, limit=5)
        print(f"\nQuery: '{query}'")
        print(f"Suggestions: {', '.join(suggestions)}")
    
    # Example 2: Search by object type
    print("\n" + "=" * 80)
    print("Example 2: Search by object type")
    print("-" * 80)
    
    print("\nStars containing 'alpha':")
    star_matches = search.suggest_names("alpha", limit=5, object_type='star')
    for name in star_matches:
        print(f"  - {name}")
    
    print("\nDSOs containing 'nebula':")
    dso_matches = search.suggest_names("nebula", limit=5, object_type='dso')
    for name in dso_matches:
        print(f"  - {name}")
    
    # Example 3: Catalog prefix search
    print("\n" + "=" * 80)
    print("Example 3: Catalog prefix search")
    print("-" * 80)
    
    catalogs = ["M ", "NGC 1", "HIP 1", "IC "]
    for catalog in catalogs:
        matches = search.search_by_prefix(catalog, limit=5)
        print(f"\n{catalog}*: {', '.join(matches)}")
    
    # Example 4: Detailed object lookup
    print("\n" + "=" * 80)
    print("Example 4: Detailed object information")
    print("-" * 80)
    
    objects = ["Sirius", "M31", "HIP 1", "Betelgeuse", "Andromeda Galaxy"]
    for obj_name in objects:
        obj = search.get_object_info(obj_name)
        print(f"\n{obj_name}:")
        print("-" * 40)
        print(search.format_object_info(obj))
    
    # Example 5: Interactive search
    print("\n" + "=" * 80)
    print("Example 5: Interactive search")
    print("-" * 80)
    print("\nTry searching for sky objects!")
    print("(Type 'quit' to exit)\n")
    
    while True:
        try:
            query = input("Search: ").strip()
            if query.lower() in ['quit', 'exit', 'q']:
                break
            
            if not query:
                continue
            
            # Get suggestions
            suggestions = search.suggest_names(query, limit=10)
            
            if not suggestions:
                print("  No matches found.\n")
                continue
            
            print(f"\n  Found {len(suggestions)} matches:")
            for i, name in enumerate(suggestions, 1):
                print(f"    {i}. {name}")
            
            # Ask user to select one for details
            try:
                choice = input("\n  Enter number for details (or press Enter to skip): ").strip()
                if choice and choice.isdigit():
                    idx = int(choice) - 1
                    if 0 <= idx < len(suggestions):
                        obj = search.get_object_info(suggestions[idx])
                        print("\n  " + "-" * 40)
                        print("  " + search.format_object_info(obj).replace("\n", "\n  "))
                        print("  " + "-" * 40)
            except:
                pass
            
            print()
        
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except EOFError:
            break


if __name__ == "__main__":
    demo()
