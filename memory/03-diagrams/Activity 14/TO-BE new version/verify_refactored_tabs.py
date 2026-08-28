import xml.etree.ElementTree as ET
import re

def main():
    file_path = r"C:\Users\iznamu\OneDrive - Panyapiwat Institute of Management\CAI 2nd Year 2025\CAI 2.2 2026\PMO1-03-08-2026\E-CMIS\diagram\Activity 14\TO-BE new version\TOBE_Activity_14_v1_9.drawio"
    
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        print("XML is well-formed.")
        
        # Check tabs
        diagrams = root.findall('.//diagram')
        print(f"Total diagrams: {len(diagrams)}")
        for idx, d in enumerate(diagrams):
            print(f"Tab {idx}: {d.get('name')}")
            
        # Check SYS codes
        sys_codes = []
        for d in diagrams:
            name = d.get('name')
            if not name.startswith("A4"): continue
            mx_model = d.find('.//mxGraphModel')
            if mx_model is None: continue
            root_node = mx_model.find('root')
            if root_node is None: continue
            
            for cell in root_node.findall('mxCell'):
                val = cell.get('value', '')
                m = re.findall(r'SYS\d+', val)
                for code in m:
                    sys_codes.append((name, cell.get('id'), code))
                    
        print(f"\nTotal SYS codes found: {len(sys_codes)}")
        # Check if they are unique and sequential
        sys_nums = []
        for name, cid, code in sys_codes:
            num = int(code.replace('SYS', ''))
            sys_nums.append(num)
            
        sys_nums_sorted = sorted(list(set(sys_nums)))
        print(f"SYS numbers range: {sys_nums_sorted[0]} to {sys_nums_sorted[-1]}")
        print(f"Unique SYS codes count: {len(sys_nums_sorted)}")
        
        # Find any missing numbers
        expected = list(range(1, 135))
        missing = [x for x in expected if x not in sys_nums_sorted]
        print(f"Missing SYS numbers: {missing}")
        
        # Check for duplicates
        duplicates = {}
        for num in sys_nums:
            duplicates[num] = duplicates.get(num, 0) + 1
        dup_list = [k for k, v in duplicates.items() if v > 1]
        print(f"Duplicate SYS numbers: {dup_list}")
        
    except Exception as e:
        print(f"Verification failed: {e}")

if __name__ == "__main__":
    main()
