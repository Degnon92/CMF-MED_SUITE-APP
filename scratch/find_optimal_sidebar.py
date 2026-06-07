def get_height(spec_fs, doc_fs, margin):
    # 13 specialties, 17 doctors
    # Line height is 1.25
    title_h = 13 * (spec_fs * 1.25 + 4)
    doc_h = 17 * (doc_fs * 1.25 + 2)
    margin_h = 13 * margin
    padding_h = 20 # 10px top, 10px bottom
    return title_h + doc_h + margin_h + padding_h

print("Simulation of heights:")
for spec_fs in [12, 12.5, 13, 13.5, 14]:
    for doc_fs in [11, 11.5, 12, 12.5, 13]:
        for margin in [14, 15, 16, 17, 18, 19, 20]:
            h = get_height(spec_fs, doc_fs, margin)
            if h <= 830:
                print(f"spec_fs={spec_fs}, doc_fs={doc_fs}, margin={margin} => height={h:.1f}px")
